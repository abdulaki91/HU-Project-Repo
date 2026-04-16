import express from "express";
import * as User from "../controllers/userController.js";
import * as Auth from "../controllers/authController.js";
import { authenticateUser, authRateLimit } from "../middleware/authenticate.js";
import {
  validateRequest,
  userRegistrationSchema,
  userLoginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// Initialize table
router.get("/create-user-table", User.createUserTableController);

// Authentication routes with rate limiting and validation
router.post(
  "/register",
  authRateLimit,
  validateRequest(userRegistrationSchema),
  Auth.registerUser,
);

router.post(
  "/login",
  authRateLimit,
  validateRequest(userLoginSchema),
  Auth.loginUser,
);

router.post("/forgot-password", authRateLimit, Auth.forgotPassword);

router.post("/reset-password/:token", authRateLimit, Auth.resetPassword);

router.post("/refresh-token", Auth.refreshToken);

// Verify email token
router.get("/verify/:token", User.verifyToken);

// Protected routes
router.use(authenticateUser); // All routes below require authentication

// Profile management
router.get("/me", User.getUserByIdController);

router.put(
  "/update/:id",
  validateRequest(updateProfileSchema),
  User.updateUserController,
);

router.put(
  "/change-password",
  validateRequest(changePasswordSchema),
  User.changeUserPassword,
);

// User search and discovery
router.get("/search", User.searchUsers);

router.get("/stats", User.getUserStats);

router.get("/activity", User.getUserActivity);
router.get("/activity/:id", User.getUserActivity);

// Admin routes
router.get("/list", User.getUserList);

router.put("/status/:id", User.updateUserStatus);

router.delete("/account/:id", User.deleteUserAccount);

export default router;
