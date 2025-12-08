// routes/projectRoutes.js
import express from "express";
import * as Project from "../controllers/projectController.js";
import { authenticateUser } from "../middlware/authenticate.js";
import { roleMiddleware } from "../middlware/roleMiddlware.js";
import { uploadProjectFile } from "../middlware/upload.js";
const router = express.Router();
router.get("/create-project-table", Project.createProjectTable);
router.get("/get-all", authenticateUser, Project.getUserProjects); // GET all projects
router.get("/my", authenticateUser, Project.getMyProjects); // GET projects for logged-in user
router.get("/download/:id", authenticateUser, Project.downloadProject); // download project file
router.post(
  "/create",
  authenticateUser,
  uploadProjectFile.single("file"),
  Project.addProject
); // CREATE new project

router.put("/update/:id", authenticateUser, Project.editProject); // UPDATE project
router.delete("/delete/:id", authenticateUser, Project.removeProject); // DELETE project
router.put("/status/:id", authenticateUser, roleMiddleware(["admin"]), Project.setProjectStatus); // Admin approve/reject

export default router;
