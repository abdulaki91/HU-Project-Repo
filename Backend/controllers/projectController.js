import * as Project from "../models/projectModel.js";
import * as User from "../models/userModel.js";
import path from "path";
import fs from "fs";
import { asyncHandler } from "../middleware/errorHandler.js";

// ✅ Create projects table
export const createProjectTable = asyncHandler(async (req, res) => {
  await Project.createProjectsTable();
  res.status(200).json({
    success: true,
    message: "Project table is ready.",
  });
});

export const addProject = asyncHandler(async (req, res) => {
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

  // Ensure author_name and department are set (prefer server-side user info)
  const authorNameFromUser =
    user.firstName || user.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : user.name || null;

  projectData.author_name = projectData.author_name || authorNameFromUser;
  projectData.department = projectData.department || user.department || null;

  await Project.createProject(projectData);

  res.status(201).json({
    success: true,
    message: "Project created successfully and is pending approval",
    data: {
      id: projectData.id,
      title: projectData.title,
      status: projectData.status,
    },
  });
});

// ✅ Get all approved projects with pagination and filtering
export const getProjects = asyncHandler(async (req, res) => {
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
    status: "approved", // Only show approved projects to regular users
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

// ✅ Get single project by ID
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

// ✅ Edit project (only by creator or admin)
export const editProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const [rows] = await Project.getProjectById(id);
  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  const project = rows[0];

  // Check permissions: creator or admin in same department
  const isCreator = project.author_id === userId;
  const isAdminInSameDept =
    userRole === "admin" && req.user.department === project.department;

  if (!isCreator && !isAdminInSameDept) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to edit this project",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  // If project is approved and user is not admin, don't allow editing
  if (project.status === "approved" && userRole !== "admin") {
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

// ✅ Remove project (only by creator or admin)
export const removeProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const [rows] = await Project.getProjectById(id);
  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  const project = rows[0];

  // Check permissions
  const isCreator = project.author_id === userId;
  const isAdminInSameDept =
    userRole === "admin" && req.user.department === project.department;
  const isSuperAdmin = userRole === "super-admin";

  if (!isCreator && !isAdminInSameDept && !isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to delete this project",
      code: "INSUFFICIENT_PERMISSIONS",
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

export const getUserProjects = asyncHandler(async (req, res) => {
  const { course, batch, page = 1, limit = 10 } = req.query;
  const user = req.user;

  const filters = { course, batch };

  // Admins can see projects in their department
  if (user.role === "admin" && user.department) {
    filters.department = user.department;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    includePending: user.role === "admin",
  };

  const result = await Project.getUserProjects(filters, options);

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

  // Only allow downloading approved projects (unless user is admin/creator)
  const isCreator = project.author_id === req.user.id;
  const isAdmin = req.user.role === "admin" || req.user.role === "super-admin";

  if (project.status !== "approved" && !isCreator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "This project is not available for download",
      code: "PROJECT_NOT_APPROVED",
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

// Admins: approve or reject a project in their department
export const setProjectStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const userId = req.user?.id;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be 'approved' or 'rejected'",
      code: "INVALID_STATUS",
    });
  }

  const user = await User.findUserById(userId);
  const [rows] = await Project.getProjectById(id);

  if (!rows || rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  const project = rows[0];

  // Only allow admins to change status
  if (req.user.role !== "admin" && req.user.role !== "super-admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can change project status",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  // Ensure admin's department matches project's department (unless super-admin)
  if (
    req.user.role === "admin" &&
    (!user.department ||
      !project.department ||
      user.department !== project.department)
  ) {
    return res.status(403).json({
      success: false,
      message: "Cannot modify projects outside your department",
      code: "DEPARTMENT_MISMATCH",
    });
  }

  const updateData = { status };
  if (status === "rejected" && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  await Project.updateProject(id, updateData);

  // Send notification email to project author
  try {
    const author = await User.findUserById(project.author_id);
    if (author && author.email) {
      // TODO: Implement email notification for status change
      console.log(`Should send ${status} notification to ${author.email}`);
    }
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }

  const [updatedRows] = await Project.getProjectById(id);
  res.json({
    success: true,
    message: `Project ${status} successfully`,
    data: updatedRows[0],
  });
});

export const getPendingProjects = asyncHandler(async (req, res) => {
  const { department, role } = req.user;
  const { page = 1, limit = 10 } = req.query;

  if (role !== "admin" && role !== "super-admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can view pending projects",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  const filters = { status: "pending" };

  // Regular admins can only see projects in their department
  if (role === "admin") {
    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Admin department not defined",
        code: "DEPARTMENT_NOT_DEFINED",
      });
    }
    filters.department = department;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Project.getProjectsWithPagination(filters, options);

  res.status(200).json({
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

// ✅ Search projects
export const searchProjects = asyncHandler(async (req, res) => {
  const { q: query, page = 1, limit = 10 } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Search query must be at least 2 characters long",
      code: "INVALID_SEARCH_QUERY",
    });
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Project.searchProjects(query.trim(), options);

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

// ✅ Get project statistics
export const getProjectStats = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const userDepartment = req.user.department;

  let stats;

  if (userRole === "super-admin") {
    stats = await Project.getGlobalProjectStats();
  } else if (userRole === "admin") {
    stats = await Project.getDepartmentProjectStats(userDepartment);
  } else {
    stats = await Project.getUserProjectStats(req.user.id);
  }

  res.json({
    success: true,
    data: stats,
  });
});
// ✅ Get trending projects
export const getTrendingProjects = asyncHandler(async (req, res) => {
  const { limit = 10, days = 7 } = req.query;

  const projects = await Project.getTrendingProjects(
    parseInt(limit),
    parseInt(days),
  );

  res.json({
    success: true,
    data: projects,
  });
});

// ✅ Get featured projects
export const getFeaturedProjects = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const projects = await Project.getFeaturedProjects(parseInt(limit));

  res.json({
    success: true,
    data: projects,
  });
});

// ✅ Get related projects
export const getRelatedProjects = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;

  const projects = await Project.getRelatedProjects(id, parseInt(limit));

  res.json({
    success: true,
    data: projects,
  });
});

// ✅ Toggle featured status (admin only)
export const toggleFeaturedStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { featured = true } = req.body;

  const [rows] = await Project.getProjectById(id);
  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
  }

  await Project.toggleFeaturedStatus(id, featured);

  res.json({
    success: true,
    message: `Project ${featured ? "featured" : "unfeatured"} successfully`,
  });
});

// ✅ Bulk update project status (admin only)
export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { projectIds, status, rejectionReason } = req.body;
  const userRole = req.user.role;
  const userDepartment = req.user.department;

  if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Project IDs array is required",
      code: "MISSING_PROJECT_IDS",
    });
  }

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be 'approved' or 'rejected'",
      code: "INVALID_STATUS",
    });
  }

  // For regular admins, verify all projects are in their department
  if (userRole === "admin") {
    const projects = await Project.getProjectsByIds(projectIds);
    const invalidProjects = projects.filter(
      (p) => p.department !== userDepartment,
    );

    if (invalidProjects.length > 0) {
      return res.status(403).json({
        success: false,
        message: "Cannot modify projects outside your department",
        code: "DEPARTMENT_MISMATCH",
      });
    }
  }

  await Project.bulkUpdateProjectStatus(projectIds, status, rejectionReason);

  res.json({
    success: true,
    message: `${projectIds.length} projects ${status} successfully`,
  });
});
// ✅ Get projects by multiple IDs (for bulk operations)
export const getProjectsByIds = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Project IDs array is required",
      code: "MISSING_PROJECT_IDS",
    });
  }

  const projects = await Project.getProjectsByIds(ids);

  res.json({
    success: true,
    data: projects,
  });
});

// ✅ Advanced project analytics (admin only)
export const getAdvancedAnalytics = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const userDepartment = req.user.department;

  if (userRole !== "admin" && userRole !== "super-admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can view analytics",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  const { timeframe = "30d", department } = req.query;

  let analytics;

  if (userRole === "super-admin") {
    analytics = await Project.getAdvancedAnalytics(timeframe, department);
  } else {
    analytics = await Project.getAdvancedAnalytics(timeframe, userDepartment);
  }

  res.json({
    success: true,
    data: analytics,
  });
});

// ✅ Export projects data (admin only)
export const exportProjects = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const userDepartment = req.user.department;

  if (userRole !== "admin" && userRole !== "super-admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can export data",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  const { format = "csv", filters = {} } = req.query;

  // Apply department filter for regular admins
  if (userRole === "admin") {
    filters.department = userDepartment;
  }

  const projects = await Project.getProjectsForExport(filters);

  if (format === "csv") {
    const csv = await Project.convertToCSV(projects);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="projects.csv"');
    res.send(csv);
  } else if (format === "json") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="projects.json"',
    );
    res.json({
      success: true,
      data: projects,
      exportedAt: new Date().toISOString(),
      totalRecords: projects.length,
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid format. Supported formats: csv, json",
      code: "INVALID_FORMAT",
    });
  }
});
// ✅ Get projects by multiple IDs (for bulk operations)
export const getProjectsByIds = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Project IDs array is required",
      code: "MISSING_PROJECT_IDS",
    });
  }

  const projects = await Project.getProjectsByIds(ids);

  res.json({
    success: true,
    data: projects,
  });
});
