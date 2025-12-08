import * as Project from "../models/projectModel.js";
import * as User from "../models/userModel.js";
import path from "path";
import fs from "fs";

// ✅ Create projects table
export const createProjectTable = async (req, res, next) => {
  try {
    await Project.createProjectsTable();
    res.status(200).json({ message: "Project table is ready." });
  } catch (err) {
    next(err);
  }
};
export const addProject = async (req, res) => {
  try {
    const author_id = req.user.id;

    if (!author_id)
      return res.status(400).json({ error: "author_id is required" });

    const user = await User.findUserById(author_id);
    if (!user) return res.status(404).json({ error: "Author user not found" });

    const file_path = req.file ? req.file.path : null;

    // console.log("File ", req.file);
    const projectData = {
      ...req.body,
      author_id,
      file_path,
      downloads: 0,
      views: 0,
    };

    // Ensure author_name and department are set (prefer server-side user info)
    const authorNameFromUser =
      user.firstName || user.lastName
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
        : user.name || null;

    projectData.author_name = projectData.author_name || authorNameFromUser;
    projectData.department = projectData.department || user.department || null;

    // await Project.createProject(projectData);

    console.log(projectData);
    res.status(201).json({ message: "Project created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create project" });
  }
};

// ✅ Get all projects
export const getProjects = async (req, res) => {
  try {
    const { course, batch } = req.query;
    const filters = { course, batch };
    const projects = await Project.getUserProjects(filters);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// ✅ Add a new project (requires author_id)

// ✅ Edit project (only by creator)
export const editProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const [rows] = await Project.getProjectById(id);
    if (rows.length === 0)
      return res.status(404).json({ message: "Project not found" });

    const project = rows[0];
    if (project.author_id !== userId)
      return res
        .status(403)
        .json({ error: "Only the creator can edit this project" });

    // Only update fields provided in body
    await Project.updateProject(id, req.body);

    // return updated project
    const [updatedRows] = await Project.getProjectById(id);
    res.json({
      message: "Project updated successfully",
      project: updatedRows[0],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
};

// ✅ Remove project (only by creator)
export const removeProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { author_id } = req.body; // ID of user attempting delete

    const [rows] = await Project.getProjectById(id);
    if (rows.length === 0)
      return res.status(404).json({ message: "Project not found" });

    const project = rows[0];
    if (project.author_id !== author_id)
      return res
        .status(403)
        .json({ error: "Only the creator can delete this project" });

    await Project.deleteProject(id);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const { course, batch } = req.query;

    const filters = { course, batch };
    const projects = await Project.getUserProjects(filters);

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user projects" });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    const authorId = req.user.id;
    const { course, batch } = req.query;

    const filters = { course, batch };
    const projects = await Project.getProjectsByAuthor(authorId, filters);

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch my projects" });
  }
};

export const downloadProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await Project.getProjectById(id);
    if (!rows || rows.length === 0)
      return res.status(404).json({ message: "Project not found" });

    const project = rows[0];
    if (!project.file_path)
      return res
        .status(404)
        .json({ message: "File not found for this project" });

    // Secure the path: ensure file_path is under uploads/projects
    const uploadsDir = path.resolve("uploads", "projects");
    const requestedPath = path.resolve(project.file_path);
    if (!requestedPath.startsWith(uploadsDir)) {
      return res.status(400).json({ message: "Invalid file path" });
    }

    if (!fs.existsSync(requestedPath))
      return res.status(404).json({ message: "File does not exist on server" });

    // increment downloads (best-effort, don't block sending file)
    try {
      await Project.incrementDownloads(id);
    } catch (e) {
      console.error("Failed to increment downloads", e);
    }

    // send file as attachment
    const filename = path.basename(requestedPath);
    res.download(requestedPath, filename, (err) => {
      if (err) console.error("Error sending file", err);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to download project" });
  }
};

// Admins: approve or reject a project in their department
export const setProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected 'approved' or 'rejected'
    const userId = req.user?.id;
    const user = await User.findUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const [rows] = await Project.getProjectById(id);
    if (!rows || rows.length === 0)
      return res.status(404).json({ message: "Project not found" });

    const project = rows[0];

    // Only allow admins to change status
    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ message: "Only admins can change project status" });

    // Ensure admin's department matches project's course (department -> course mapping)
    if (
      user.department &&
      project.course &&
      user.department !== project.course
    ) {
      return res
        .status(403)
        .json({ message: "Cannot modify projects outside your department" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await Project.updateProject(id, { status });

    const [updatedRows] = await Project.getProjectById(id);
    res.json({ message: "Project status updated", project: updatedRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update project status" });
  }
};
