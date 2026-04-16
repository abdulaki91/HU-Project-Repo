import * as Project from "../models/projectModel.js";
import * as User from "../models/userModel.js";
import path from "path";
import fs from "fs";
import { asyncHandler } from "../middleware/errorHandler.js";

// ===== UTILITY FUNCTIONS =====

// ✅ Create projects table (utility function)
export const createProjectTable = asyncHandler(async (req, res) => {
  await Project.createProjectsTable();
  res.status(200).json({
    success: true,
    message: "Project table is ready.",
  });
});

// ===== PUBLIC ENDPOINTS =====

// ✅ Get all approved projects (public browsing)
export const getApprovedProjects = asyncHandler(async (req, res) => {
  const {
    course,
    batch,
    department,
    search,
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "desc",
  } = req.query;

  const filters = {
    course,
    batch,
    department,
    search,
    status: "approved", // Only show approved projects
  };

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  };

  const result = await Project.getProjectsWithPagination(filters, options);

  res.json({
    success: true,
    data: result.projects,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

// ✅ Get single project by ID (public)
export const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [rows] = await Project.getProjectById(id);
  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  const project = rows[0];

  // Increment view count
  try {
    await Project.incrementViews(id);
    project.views = (project.views || 0) + 1;
  } catch (error) {
    console.error("Failed to increment views:", error);
  }

  res.json({
    success: true,
    data: project,
  });
});

// ✅ Download project file
export const downloadProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [rows] = await Project.getProjectById(id);
  if (!rows || rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  const project = rows[0];

  // Check download permissions:
  // - Anyone can download approved projects
  // - Only project owner can download their own pending/rejected projects
  // - Admins can download projects from their department
  let canDownload = false;

  if (project.status === "approved") {
    canDownload = true; // Anyone can download approved projects
  } else if (req.user) {
    // Check if user is the project owner
    if (project.author_id === req.user.id) {
      canDownload = true;
    }
    // Check if user is admin from same department
    else if (
      req.user.role === "admin" &&
      req.user.department === project.department
    ) {
      canDownload = true;
    }
  }

  if (!canDownload) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to download this project",
      code: "DOWNLOAD_NOT_ALLOWED",
    });
  }

  if (!project.file_path) {
    return res.status(404).json({
      success: false,
      message: "File not found for this project",
      code: "FILE_NOT_FOUND",
    });
  }

  // Secure the path: ensure file_path is under uploads/projects
  const uploadsDir = path.resolve("uploads", "projects");
  const requestedPath = path.resolve(project.file_path);

  if (!requestedPath.startsWith(uploadsDir)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file path",
      code: "INVALID_FILE_PATH",
    });
  }

  if (!fs.existsSync(requestedPath)) {
    return res.status(404).json({
      success: false,
      message: "File does not exist on server",
      code: "FILE_NOT_EXISTS",
    });
  }

  // Increment downloads (best-effort, don't block sending file)
  try {
    await Project.incrementDownloads(id);
  } catch (e) {
    console.error("Failed to increment downloads", e);
  }

  // Send file as attachment
  const filename = path.basename(requestedPath);
  res.download(requestedPath, filename, (err) => {
    if (err) {
      console.error("Error sending file", err);
    }
  });
});

// ===== STUDENT ENDPOINTS =====

// ✅ Upload new project (students only)
export const uploadProject = asyncHandler(async (req, res) => {
  const author_id = req.user.id;

  if (!author_id) {
    return res.status(400).json({
      success: false,
      message: "Author ID is required",
      code: "MISSING_AUTHOR_ID",
    });
  }

  const user = await User.findUserById(author_id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Author user not found",
      code: "AUTHOR_NOT_FOUND",
    });
  }

  const file_path = req.file ? req.file.path : null;

  const projectData = {
    ...req.body,
    author_id,
    file_path,
    downloads: 0,
    views: 0,
    status: "pending",
  };

  // Ensure author_name and department are set from user info
  const authorNameFromUser =
    user.firstName || user.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : user.name || null;

  projectData.author_name = projectData.author_name || authorNameFromUser;
  projectData.department = projectData.department || user.department || null;

  await Project.createProject(projectData);

  res.status(201).json({
    success: true,
    message: "Project uploaded successfully and is pending approval",
    data: {
      id: projectData.id,
      title: projectData.title,
      status: projectData.status,
    },
  });
});

// ✅ Get user's own projects (all statuses)
export const getMyProjects = asyncHandler(async (req, res) => {
  const authorId = req.user.id;
  const { course, batch, page = 1, limit = 10, status } = req.query;

  const filters = { course, batch, status };
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Project.getProjectsByAuthor(authorId, filters, options);

  res.json({
    success: true,
    data: result.projects,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

// ✅ Edit user's own project (only if pending or rejected)
export const editMyProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const [rows] = await Project.getProjectById(id);
  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  const project = rows[0];

  // Check if user owns the project
  if (project.author_id !== userId) {
    return res.status(403).json({
      success: false,
      message: "You can only edit your own projects",
      code: "NOT_PROJECT_OWNER",
    });
  }

  // Check if project can be edited (only pending or rejected)
  if (project.status === "approved") {
    return res.status(403).json({
      success: false,
      message: "Cannot edit approved projects",
      code: "CANNOT_EDIT_APPROVED",
    });
  }

  await Project.updateProject(id, req.body);

  const [updatedRows] = await Project.getProjectById(id);
  res.json({
    success: true,
    message: "Project updated successfully",
    data: updatedRows[0],
  });
});

// ✅ Delete user's own project
export const deleteMyProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const [rows] = await Project.getProjectById(id);
  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  const project = rows[0];

  // Check if user owns the project
  if (project.author_id !== userId) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own projects",
      code: "NOT_PROJECT_OWNER",
    });
  }

  // Delete associated file if exists
  if (project.file_path && fs.existsSync(project.file_path)) {
    try {
      fs.unlinkSync(project.file_path);
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  }

  await Project.deleteProject(id);

  res.json({
    success: true,
    message: "Project deleted successfully",
  });
});

// ===== ADMIN ENDPOINTS =====

// ✅ Get all projects from admin's department (all statuses)
export const getDepartmentProjects = asyncHandler(async (req, res) => {
  const { department } = req.user;
  const { page = 1, limit = 10, status, course, batch } = req.query;

  if (!department) {
    return res.status(400).json({
      success: false,
      message: "Admin department not defined",
      code: "DEPARTMENT_NOT_DEFINED",
    });
  }

  const filters = { department, status, course, batch };
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Project.getProjectsWithPagination(filters, options);

  res.json({
    success: true,
    data: result.projects,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

// ✅ Get pending projects from admin's department
export const getPendingDepartmentProjects = asyncHandler(async (req, res) => {
  const { department } = req.user;
  const { page = 1, limit = 10 } = req.query;

  if (!department) {
    return res.status(400).json({
      success: false,
      message: "Admin department not defined",
      code: "DEPARTMENT_NOT_DEFINED",
    });
  }

  const filters = { department, status: "pending" };
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Project.getProjectsWithPagination(filters, options);

  res.json({
    success: true,
    data: result.projects,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

// ✅ Approve project (admin can only approve projects from their department)
export const approveProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { department } = req.user;

  const [rows] = await Project.getProjectById(id);
  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  const project = rows[0];

  // Check if project is from admin's department
  if (project.department !== department) {
    return res.status(403).json({
      success: false,
      message: "You can only approve projects from your department",
      code: "DEPARTMENT_MISMATCH",
    });
  }

  // Check if project is pending
  if (project.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: "Only pending projects can be approved",
      code: "INVALID_STATUS",
    });
  }

  await Project.updateProject(id, { status: "approved" });

  const [updatedRows] = await Project.getProjectById(id);
  res.json({
    success: true,
    message: "Project approved successfully",
    data: updatedRows[0],
  });
});

// ✅ Reject project (admin can only reject projects from their department)
export const rejectProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  const { department } = req.user;

  const [rows] = await Project.getProjectById(id);
  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  const project = rows[0];

  // Check if project is from admin's department
  if (project.department !== department) {
    return res.status(403).json({
      success: false,
      message: "You can only reject projects from your department",
      code: "DEPARTMENT_MISMATCH",
    });
  }

  // Check if project is pending
  if (project.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: "Only pending projects can be rejected",
      code: "INVALID_STATUS",
    });
  }

  const updateData = { status: "rejected" };
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  await Project.updateProject(id, updateData);

  const [updatedRows] = await Project.getProjectById(id);
  res.json({
    success: true,
    message: "Project rejected successfully",
    data: updatedRows[0],
  });
});

// ===== DASHBOARD ENDPOINTS =====

// ✅ Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req, res) => {
  const { role, department } = req.user;

  let stats;
  let uploadTrends;
  let courseDistribution;
  let weeklyActivity;

  if (role === "admin") {
    // Admin sees only their department data
    stats = await Project.getDepartmentDashboardStats(department);

    // Get trends for department
    uploadTrends = await Project.getUploadTrends();
    courseDistribution = await Project.getCourseDistribution();
    weeklyActivity = await Project.getWeeklyActivity();
  } else {
    // Students and others see global stats
    stats = await Project.getDashboardStats();
    uploadTrends = await Project.getUploadTrends();
    courseDistribution = await Project.getCourseDistribution();
    weeklyActivity = await Project.getWeeklyActivity();
  }

  res.json({
    success: true,
    data: {
      stats,
      uploadTrends,
      courseDistribution,
      weeklyActivity,
    },
  });
});
