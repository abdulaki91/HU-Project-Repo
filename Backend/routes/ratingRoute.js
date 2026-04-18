// routes/ratingRoute.js
import express from "express";
import * as Rating from "../controllers/ratingController.js";
import { authenticateUser } from "../middleware/authenticate.js";
import { validateRequest } from "../middleware/validation.js";
import Joi from "joi";

const router = express.Router();

// Rating validation schema
const ratingSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.base": "Rating must be a number",
    "number.integer": "Rating must be a whole number",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot be more than 5",
    "any.required": "Rating is required",
  }),
  review: Joi.string().trim().max(1000).optional().allow("", null).messages({
    "string.max": "Review cannot exceed 1000 characters",
  }),
});

// ===== PUBLIC ROUTES =====

// Get top rated projects
router.get("/top-rated", Rating.getTopRatedProjects);

// Get project ratings and statistics
router.get("/project/:projectId", Rating.getProjectRatings);

// ===== PROTECTED ROUTES (Authentication required) =====
router.use(authenticateUser);

// Add or update rating for a project
router.post(
  "/project/:projectId",
  validateRequest(ratingSchema),
  Rating.addRating,
);

// Get user's rating for a specific project
router.get("/project/:projectId/my-rating", Rating.getUserRating);

// Delete user's rating for a project
router.delete("/project/:projectId", Rating.deleteRating);

// Get user's recent ratings
router.get("/my-ratings", Rating.getUserRecentRatings);

export default router;
