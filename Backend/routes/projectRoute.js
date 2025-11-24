// routes/projectRoutes.js
import express from "express";
import * as Project from "../controllers/projectController.js";
import { authenticateUser } from "../middlware/authenticate.js";
import { uploadProjectFile } from "../middlware/upload.js";
const router = express.Router();
router.get("/create-project-table", Project.createProjectTable);
router.get("/get-all", Project.getProjects); // GET all projects
router.get("get/:id", Project.getProject); // GET project by ID
router.post(
  "/create",
  authenticateUser,
  uploadProjectFile.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }, // example for another file
  ]),
  Project.addProject
); // CREATE new project

router.put("update/:id", Project.editProject); // UPDATE project
router.delete("delete/:id", Project.removeProject); // DELETE project

export default router;
