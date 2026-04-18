// controllers/ratingController.js
import * as Rating from "../models/ratingModel.js";
import * as Project from "../models/projectModel.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// ✅ Add or update a rating for a project
export const addRating = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { rating, review } = req.body;
  const userId = req.user.id;

  // Validate rating value
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5",
      code: "INVALID_RATING",
    });
  }

  // Check if project exists and is approved
  const [projectRows] = await Project.getProjectById(projectId);
  if (projectRows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  const project = projectRows[0];
  if (project.status !== "approved") {
    return res.status(400).json({
      success: false,
      message: "You can only rate approved projects",
      code: "PROJECT_NOT_APPROVED",
    });
  }

  // Prevent users from rating their own projects
  if (project.author_id === userId) {
    return res.status(400).json({
      success: false,
      message: "You cannot rate your own project",
      code: "CANNOT_RATE_OWN_PROJECT",
    });
  }

  // Add or update the rating
  await Rating.addOrUpdateRating(projectId, userId, rating, review);

  // Get updated rating statistics
  const stats = await Rating.getProjectRatingStats(projectId);

  res.json({
    success: true,
    message: "Rating submitted successfully",
    data: {
      rating,
      review,
      stats,
    },
  });
});

// ✅ Get user's rating for a specific project
export const getUserRating = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  const userRating = await Rating.getUserRating(projectId, userId);

  res.json({
    success: true,
    data: userRating,
  });
});

// ✅ Get project rating statistics and recent ratings
export const getProjectRatings = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "desc",
  } = req.query;

  // Check if project exists
  const [projectRows] = await Project.getProjectById(projectId);
  if (projectRows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  // Get rating statistics
  const stats = await Rating.getProjectRatingStats(projectId);

  // Get ratings with pagination
  const ratingsData = await Rating.getProjectRatings(projectId, {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  });

  res.json({
    success: true,
    data: {
      stats,
      ratings: ratingsData.ratings,
      pagination: ratingsData.pagination,
    },
  });
});

// ✅ Delete user's rating for a project
export const deleteRating = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  // Check if user has rated this project
  const userRating = await Rating.getUserRating(projectId, userId);
  if (!userRating) {
    return res.status(404).json({
      success: false,
      message: "You haven't rated this project",
      code: "RATING_NOT_FOUND",
    });
  }

  // Delete the rating
  await Rating.deleteRating(projectId, userId);

  // Get updated rating statistics
  const stats = await Rating.getProjectRatingStats(projectId);

  res.json({
    success: true,
    message: "Rating removed successfully",
    data: { stats },
  });
});

// ✅ Get user's recent ratings
export const getUserRecentRatings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 10 } = req.query;

  const recentRatings = await Rating.getUserRecentRatings(
    userId,
    parseInt(limit),
  );

  res.json({
    success: true,
    data: recentRatings,
  });
});

// ✅ Get top rated projects (public endpoint)
export const getTopRatedProjects = asyncHandler(async (req, res) => {
  const { limit = 10, minRatings = 3 } = req.query;

  const topRatedProjects = await Rating.getTopRatedProjects(
    parseInt(limit),
    parseInt(minRatings),
  );

  res.json({
    success: true,
    data: topRatedProjects,
  });
});
