import * as Project from "../models/projectModel.js";
import * as User from "../models/userModel.js";

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

    const projectData = {
      ...req.body,
      author_id,
      file_path,
      // tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      downloads: 0,
      views: 0,
    };

    await Project.createProject(projectData);

    res.status(201).json({ message: "Project created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create project" });
  }
};

// ✅ Get all projects
export const getProjects = async (req, res) => {
  try {
    const [rows] = await Project.getAllProjects();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// ✅ Get a project by ID
export const getProject = async (req, res) => {
  try {
    const [rows] = await Project.getProjectById(req.params.id);
    if (rows.length === 0)
      return res.status(404).json({ message: "Project not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

// ✅ Add a new project (requires author_id)

// ✅ Edit project (only by creator)
export const editProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { author_id } = req.body; // ID of user attempting edit

    const [rows] = await Project.getProjectById(id);
    if (rows.length === 0)
      return res.status(404).json({ message: "Project not found" });

    const project = rows[0];
    if (project.author_id !== author_id)
      return res
        .status(403)
        .json({ error: "Only the creator can edit this project" });

    await Project.updateProject(id, req.body);
    res.json({ message: "Project updated successfully" });
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

// ✅ Get all projects created by a specific user
export const getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const projects = await User.getUserProjects(userId);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user projects" });
  }
};
