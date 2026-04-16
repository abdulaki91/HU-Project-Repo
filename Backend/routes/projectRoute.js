// routes/projectRoutes.js
import express from "express";
import * as Project from "../controllers/projectController.js";
import { authenticateUser } from "../middleware/authenticate.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { uploadProjectFile } from "../middleware/upload.js";
import {
  validateRequest,
  projectSchema,
  projectUpdateSchema,
  projectStatusSchema,
  validateFileUpload,
  parseFormDataFields,
} from "../middleware/validation.js";

const router = express.Router();

// ===== PUBLIC ROUTES (No authentication required) =====

// Browse all approved projects (students can see approved projects from all departments)
router.get("/browse-approved", Project.getApprovedProjects);
router.get("/get-all", Project.getApprovedProjects); // Alias for frontend compatibility

// View single project details
router.get("/view/:id", Project.getProjectById);

// Download project file
router.get("/download/:id", Project.downloadProject);

// ===== PROTECTED ROUTES (Authentication required) =====
router.use(authenticateUser);

// ===== STUDENT ROUTES =====

// Students: View their own uploaded projects (all statuses)
router.get("/my-projects", Project.getMyProjects);
router.get("/my", Project.getMyProjects); // Alias for frontend compatibility

// Students: Upload new project
router.post(
  "/upload",
  uploadProjectFile.single("file"),
  validateFileUpload,
  parseFormDataFields,
  validateRequest(projectSchema),
  Project.uploadProject,
);

// Students: Edit their own project (only if pending or rejected)
router.put(
  "/edit/:id",
  validateRequest(projectUpdateSchema),
  Project.editMyProject,
);

// Students: Delete their own project
router.delete("/delete/:id", Project.deleteMyProject);

// ===== ADMIN ROUTES =====

// Admin: View projects from their department (all statuses)
router.get(
  "/admin/department-projects",
  roleMiddleware(["admin"]),
  Project.getDepartmentProjects,
);

// Admin: View pending projects from their department
router.get(
  "/admin/pending-projects",
  roleMiddleware(["admin"]),
  Project.getPendingDepartmentProjects,
);

// Admin: Approve or reject project from their department
router.put(
  "/admin/approve/:id",
  roleMiddleware(["admin"]),
  validateRequest(projectStatusSchema),
  Project.approveProject,
);

router.put(
  "/admin/reject/:id",
  roleMiddleware(["admin"]),
  validateRequest(projectStatusSchema),
  Project.rejectProject,
);

// ===== DASHBOARD ROUTES =====

// Dashboard statistics (authenticated users only)
router.get("/dashboard/stats", Project.getDashboardStats);

export default router;
