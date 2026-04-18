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

// ✅ Get global top technologies (for homepage)
export const getGlobalTopTechnologies = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const topTechnologies = await Project.getTopTechnologies(parseInt(limit));

  res.json({
    success: true,
    data: topTechnologies,
  });
});

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
  // - Anyone (authenticated) can download approved projects
  // - Project owner can download their own projects (any status)
  // - Admins can download projects from their department (any status)
  // - Super admins can download any project
  let canDownload = false;

  if (project.status === "approved") {
    canDownload = true; // Any authenticated user can download approved projects
  } else if (req.user) {
    // Check if user is the project owner
    if (project.author_id === req.user.id) {
      canDownload = true;
    }
    // Check if user is super admin
    else if (req.user.role === "super-admin") {
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

// ✅ Preview project file (for admins to review without downloading)
export const previewProject = asyncHandler(async (req, res) => {
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

  // Check preview permissions (same as download but focused on admin review)
  let canPreview = false;

  if (project.status === "approved") {
    canPreview = true; // Any authenticated user can preview approved projects
  } else if (req.user) {
    // Check if user is the project owner
    if (project.author_id === req.user.id) {
      canPreview = true;
    }
    // Check if user is super admin
    else if (req.user.role === "super-admin") {
      canPreview = true;
    }
    // Check if user is admin from same department
    else if (
      req.user.role === "admin" &&
      req.user.department === project.department
    ) {
      canPreview = true;
    }
  }

  if (!canPreview) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to preview this project",
      code: "PREVIEW_NOT_ALLOWED",
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

  const filename = path.basename(requestedPath);
  const fileExtension = path.extname(filename).toLowerCase();
  const fileStats = fs.statSync(requestedPath);

  // Get file info
  const fileInfo = {
    filename,
    size: fileStats.size,
    extension: fileExtension,
    uploadDate: project.created_at,
    canPreviewContent: false,
    previewType: null,
    content: null,
  };

  // Handle different file types for preview
  try {
    if (fileExtension === ".txt" || fileExtension === ".json") {
      // Text files can be previewed directly
      const content = fs.readFileSync(requestedPath, "utf8");
      fileInfo.canPreviewContent = true;
      fileInfo.previewType = "text";
      fileInfo.content =
        content.length > 10000
          ? content.substring(0, 10000) + "\n\n... (truncated)"
          : content;
    } else if (fileExtension === ".pdf") {
      // PDF files - show basic info and download prompt due to CSP restrictions
      fileInfo.canPreviewContent = false;
      fileInfo.previewType = "pdf";
      fileInfo.message = "PDF file - download to view content";
    } else if ([".zip", ".rar", ".7z"].includes(fileExtension)) {
      // Archive files - show basic info only
      fileInfo.canPreviewContent = false;
      fileInfo.previewType = "archive";
      fileInfo.message = "Archive file - download to extract and view contents";
    } else if ([".doc", ".docx", ".ppt", ".pptx"].includes(fileExtension)) {
      // Office documents - basic info only (would need additional libraries for content extraction)
      fileInfo.canPreviewContent = false;
      fileInfo.previewType = "office";
      fileInfo.message = "Office document - download to view full content";
    } else {
      fileInfo.canPreviewContent = false;
      fileInfo.previewType = "unknown";
      fileInfo.message =
        "File type not supported for preview - download to view";
    }
  } catch (error) {
    console.error("Error reading file for preview:", error);
    fileInfo.canPreviewContent = false;
    fileInfo.previewType = "error";
    fileInfo.message = "Error reading file content";
  }

  res.json({
    success: true,
    data: fileInfo,
  });
});

// ✅ Serve file for preview (PDF, images, etc.)
export const previewFile = asyncHandler(async (req, res) => {
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

  // Same permission check as preview
  let canPreview = false;

  if (project.status === "approved") {
    canPreview = true;
  } else if (req.user) {
    if (project.author_id === req.user.id) {
      canPreview = true;
    } else if (req.user.role === "super-admin") {
      canPreview = true;
    } else if (
      req.user.role === "admin" &&
      req.user.department === project.department
    ) {
      canPreview = true;
    }
  }

  if (!canPreview) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to preview this project",
      code: "PREVIEW_NOT_ALLOWED",
    });
  }

  if (!project.file_path) {
    return res.status(404).json({
      success: false,
      message: "File not found for this project",
      code: "FILE_NOT_FOUND",
    });
  }

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

  const filename = path.basename(requestedPath);
  const fileExtension = path.extname(filename).toLowerCase();

  // Set appropriate content type for browser preview
  let contentType = "application/octet-stream";
  if (fileExtension === ".pdf") {
    contentType = "application/pdf";
  } else if (fileExtension === ".txt") {
    contentType = "text/plain";
  } else if (fileExtension === ".json") {
    contentType = "application/json";
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", 'inline; filename="' + filename + '"');

  // Stream the file
  const fileStream = fs.createReadStream(requestedPath);
  fileStream.pipe(res);
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

  // Prepare update data
  const updateData = { ...req.body };

  // Handle file upload if a new file is provided
  if (req.file) {
    // Delete old file if it exists
    if (project.file_path && fs.existsSync(project.file_path)) {
      try {
        fs.unlinkSync(project.file_path);
      } catch (error) {
        console.error("Failed to delete old file:", error);
        // Don't fail the update if old file deletion fails
      }
    }

    // Update with new file path
    updateData.file_path = req.file.path;
  }

  await Project.updateProject(id, updateData);

  const [updatedRows] = await Project.getProjectById(id);
  res.json({
    success: true,
    message: req.file
      ? "Project and file updated successfully"
      : "Project updated successfully",
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
  const { reason } = req.body;
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
  if (reason) {
    updateData.rejectionReason = reason;
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
  let recentProjects;
  let studentActivity;
  let topTechnologies;

  if (role === "admin") {
    // Admin sees only their department data
    stats = await Project.getDepartmentDashboardStats(department);

    // Get department-specific trends and data
    uploadTrends = await Project.getDepartmentUploadTrends(department);
    courseDistribution =
      await Project.getDepartmentCourseDistribution(department);
    weeklyActivity = await Project.getDepartmentWeeklyActivity(department);
    recentProjects = await Project.getDepartmentRecentProjects(department, 10);
    studentActivity = await Project.getDepartmentStudentActivity(department);
    topTechnologies = await Project.getDepartmentTopTechnologies(
      department,
      10,
    );
  } else {
    // Students and others see global stats
    stats = await Project.getDashboardStats();
    uploadTrends = await Project.getUploadTrends();
    courseDistribution = await Project.getCourseDistribution();
    weeklyActivity = await Project.getWeeklyActivity();
    recentProjects = null; // Students don't need this
    studentActivity = null; // Students don't need this
    topTechnologies = await Project.getTopTechnologies(10);
  }

  res.json({
    success: true,
    data: {
      stats,
      uploadTrends,
      courseDistribution,
      weeklyActivity,
      recentProjects,
      studentActivity,
      topTechnologies,
    },
  });
});

// ✅ Get user profile statistics
export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    // Get user's project statistics
    const userStats = await Project.getUserStats(userId);

    res.json({
      success: true,
      data: userStats,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
      code: "USER_STATS_ERROR",
    });
  }
});
