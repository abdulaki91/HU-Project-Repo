import request from "supertest";
import app from "../index.js";
import * as UserModel from "../models/userModel.js";

describe("Authentication Endpoints", () => {
  describe("POST /api/user/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@test.com",
        password: "password123",
        batch: "2024",
        department: "Computer Science",
      };

      const response = await request(app)
        .post("/api/user/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("registered successfully");
      expect(response.body.data.email).toBe(userData.email);
    });

    it("should reject registration with invalid email", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "invalid-email",
        password: "password123",
        batch: "2024",
        department: "Computer Science",
      };

      const response = await request(app)
        .post("/api/user/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("VALIDATION_ERROR");
    });

    it("should reject registration with weak password", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@test.com",
        password: "123",
        batch: "2024",
        department: "Computer Science",
      };

      const response = await request(app)
        .post("/api/user/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/user/login", () => {
    it("should login with valid credentials", async () => {
      // First register a user
      const userData = {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@test.com",
        password: "password123",
        batch: "2024",
        department: "Computer Science",
      };

      await request(app).post("/api/user/register").send(userData);

      // Verify the user (simulate email verification)
      const [users] = await UserModel.getUserByEmail(userData.email);
      if (users.length > 0) {
        await UserModel.verifyUser(users[0].id);
      }

      // Now login
      const loginData = {
        email: userData.email,
        password: userData.password,
      };

      const response = await request(app)
        .post("/api/user/login")
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it("should reject login with invalid credentials", async () => {
      const loginData = {
        email: "nonexistent@test.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/user/login")
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("GET /api/user/me", () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Register and login a user to get auth token
      const userData = {
        firstName: "Test",
        lastName: "User",
        email: "test.user@test.com",
        password: "password123",
        batch: "2024",
        department: "Computer Science",
      };

      await request(app).post("/api/user/register").send(userData);

      // Verify user
      const [users] = await UserModel.getUserByEmail(userData.email);
      if (users.length > 0) {
        userId = users[0].id;
        await UserModel.verifyUser(userId);
      }

      // Login to get token
      const loginResponse = await request(app).post("/api/user/login").send({
        email: userData.email,
        password: userData.password,
      });

      authToken = loginResponse.body.data.token;
    });

    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/user/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe("test.user@test.com");
    });

    it("should reject request without token", async () => {
      const response = await request(app).get("/api/user/me").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("NO_TOKEN");
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get("/api/user/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("INVALID_TOKEN");
    });
  });
});
