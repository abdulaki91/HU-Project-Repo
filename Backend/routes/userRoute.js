import express from "express";
import * as User from "../controllers/userController.js";
import * as Auth from "../controllers/authController.js";

const router = express.Router();

// Initialize table
router.get("/create-user-table", User.createUserTableController);

// Register new user (teacher or admin)
router.post("/register", Auth.registerUser);

// Login user
router.post("/login", Auth.loginUser);

// Verify email token
router.get("/verify/:token", User.verifyToken);

// Update profile (only authenticated users)
router.put("/update/:id", User.updateUserController);

// Change password
router.put("/change-password", User.changeUserPassword);

// Get user by ID
router.get("/:id", User.getUserByIdController);

// Example: route restricted to admins only

export default router;
