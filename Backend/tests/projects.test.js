import request from "supertest";
import app from "../index.js";
import path from "path";
import fs from "fs";

describe("Project Endpoints", () => {
  let authToken;
  let userId;
  let projectId;

  beforeEach(async () => {
    // Register and login a user
    const userData = {
      firstName: "Project",
      lastName: "Tester",
      email: "project.tester@test.com",
      password: "password123",
      batch: "2024",
      department: "Computer Science",
    };

    await request(app).post("/api/user/register").send(userData);

    // Login to get token
    const loginResponse = await request(app).post("/api/user/login").send({
      email: userData.email,
      password: userData.password,
    });

    authToken = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;
  });

  describe("POST /api/project/upload", () => {
    it("should upload a project successfully", async () => {
      // Create a test file
      const testFilePath = path.join(process.cwd(), "test-file.txt");
      fs.writeFileSync(testFilePath, "Test project content");

      const projectData = {
        title: "Test Project",
        description: "This is a test project for automated testing",
        course: "Software Engineering",
        department: "Computer Science",
        batch: "2024",
        tags: JSON.stringify(["test", "automation"]),
      };

      const response = await request(app)
        .post("/api/project/upload")
        .set("Authorization", `Bearer ${authToken}`)
        .field("title", projectData.title)
        .field("description", projectData.description)
        .field("course", projectData.course)
        .field("department", projectData.department)
        .field("batch", projectData.batch)
        .field("tags", projectData.tags)
        .attach("file", testFilePath)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("uploaded successfully");
      expect(response.body.data.title).toBe(projectData.title);

      projectId = response.body.data.id;

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    it("should reject upload without file", async () => {
      const projectData = {
        title: "Test Project",
        description: "This is a test project",
        course: "Software Engineering",
        department: "Computer Science",
        batch: "2024",
      };

      const response = await request(app)
        .post("/api/project/upload")
        .set("Authorization", `Bearer ${authToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("NO_FILE");
    });

    it("should reject upload with invalid data", async () => {
      const testFilePath = path.join(process.cwd(), "test-file.txt");
      fs.writeFileSync(testFilePath, "Test content");

      const response = await request(app)
        .post("/api/project/upload")
        .set("Authorization", `Bearer ${authToken}`)
        .field("title", "A") // Too short
        .field("description", "Short") // Too short
        .attach("file", testFilePath)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("VALIDATION_ERROR");

      // Cleanup
      fs.unlinkSync(testFilePath);
    });
  });

  describe("GET /api/project/browse-approved", () => {
    it("should get approved projects", async () => {
      const response = await request(app)
        .get("/api/project/browse-approved")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it("should filter projects by department", async () => {
      const response = await request(app)
        .get("/api/project/browse-approved?department=Computer Science")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/project/my-projects", () => {
    it("should get user projects with authentication", async () => {
      const response = await request(app)
        .get("/api/project/my-projects")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should reject request without authentication", async () => {
      const response = await request(app)
        .get("/api/project/my-projects")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("NO_TOKEN");
    });
  });

  describe("GET /api/project/view/:id", () => {
    it("should get project by ID", async () => {
      // First create a project to test with
      const testFilePath = path.join(process.cwd(), "test-view.txt");
      fs.writeFileSync(testFilePath, "Test content");

      const uploadResponse = await request(app)
        .post("/api/project/upload")
        .set("Authorization", `Bearer ${authToken}`)
        .field("title", "View Test Project")
        .field("description", "Project for testing view functionality")
        .field("course", "Software Engineering")
        .field("department", "Computer Science")
        .field("batch", "2024")
        .attach("file", testFilePath);

      const projectId = uploadResponse.body.data.id;

      const response = await request(app)
        .get(`/api/project/view/${projectId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(projectId);
      expect(response.body.data.title).toBe("View Test Project");

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    it("should return 404 for non-existent project", async () => {
      const response = await request(app)
        .get("/api/project/view/99999")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("PROJECT_NOT_FOUND");
    });
  });
});
