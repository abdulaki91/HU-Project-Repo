// routes/projectRoutes.js
import express from "express";
import * as Project from "../controllers/projectController.js";
import { authenticateUser } from "../middlware/authenticate.js";
import { roleMiddleware } from "../middlware/roleMiddlware.js";
import { uploadProjectFile } from "../middlware/upload.js";
import {
  validateRequest,
  projectSchema,
  validateFileUpload,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.get("/create-project-table", Project.createProjectTable);

// Public project browsing (approved projects only)
router.get("/browse", Project.getProjects);
router.get("/search", Project.searchProjects);
router.get("/trending", Project.getTrendingProjects);
router.get("/featured", Project.getFeaturedProjects);
router.get("/:id", Project.getProjectById);
router.get("/:id/related", Project.getRelatedProjects);

// Protected routes
router.use(authenticateUser);

// User project management
router.get("/my/projects", Project.getMyProjects);
router.get("/user/projects", Project.getUserProjects);

router.post(
  "/create",
  uploadProjectFile.single("file"),
  validateFileUpload,
  validateRequest(projectSchema),
  Project.addProject,
);

router.put("/update/:id", validateRequest(projectSchema), Project.editProject);

router.delete("/delete/:id", Project.removeProject);

// File operations
router.get("/download/:id", Project.downloadProject);

// Admin routes
router.get(
  "/admin/pending",
  roleMiddleware(["admin", "super-admin"]),
  Project.getPendingProjects,
);

router.put(
  "/admin/status/:id",
  roleMiddleware(["admin", "super-admin"]),
  Project.setProjectStatus,
);

router.put(
  "/admin/featured/:id",
  roleMiddleware(["admin", "super-admin"]),
  Project.toggleFeaturedStatus,
);

router.post(
  "/admin/bulk-status",
  roleMiddleware(["admin", "super-admin"]),
  Project.bulkUpdateStatus,
);

// Statistics
router.get(
  "/admin/stats",
  roleMiddleware(["admin", "super-admin"]),
  Project.getProjectStats,
);

export default router;
