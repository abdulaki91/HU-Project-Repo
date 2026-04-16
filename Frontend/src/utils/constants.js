// Application constants
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || "Haramaya University Project Store",
  version: import.meta.env.VITE_APP_VERSION || "1.0.0",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 52428800, // 50MB
  allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(",") || [
    ".zip",
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
  ],
  defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10,
  maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE) || 50,
  cacheDuration: parseInt(import.meta.env.VITE_CACHE_DURATION) || 300000, // 5 minutes
};

// User roles
export const USER_ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
  SUPER_ADMIN: "super-admin",
};

// Project statuses
export const PROJECT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Date formatter
export const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  batch: /^\d{4}$/,
  phone: /^\+?[\d\s-()]+$/,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  FILE_TOO_LARGE: `File size exceeds the maximum limit of ${formatFileSize(APP_CONFIG.maxFileSize)}.`,
  INVALID_FILE_TYPE: `Invalid file type. Allowed types: ${APP_CONFIG.allowedFileTypes.join(", ")}`,
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  LOGOUT_SUCCESS: "Logged out successfully.",
  REGISTER_SUCCESS:
    "Registration successful! Please check your email to verify your account.",
  PROFILE_UPDATED: "Profile updated successfully.",
  PASSWORD_CHANGED: "Password changed successfully.",
  PROJECT_UPLOADED: "Project uploaded successfully and is pending approval.",
  PROJECT_UPDATED: "Project updated successfully.",
  PROJECT_DELETED: "Project deleted successfully.",
  PROJECT_APPROVED: "Project approved successfully.",
  PROJECT_REJECTED: "Project rejected successfully.",
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "language",
  PREFERENCES: "preferences",
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/user/login",
  REGISTER: "/user/register",
  LOGOUT: "/user/logout",
  REFRESH_TOKEN: "/user/refresh-token",
  FORGOT_PASSWORD: "/user/forgot-password",
  RESET_PASSWORD: "/user/reset-password",

  // User
  PROFILE: "/user/me",
  UPDATE_PROFILE: "/user/update",
  CHANGE_PASSWORD: "/user/change-password",
  USER_SEARCH: "/user/search",
  USER_STATS: "/user/stats",

  // Projects
  PROJECTS_BROWSE: "/project/browse-approved",
  PROJECTS_MY: "/project/my-projects",
  PROJECT_UPLOAD: "/project/upload",
  PROJECT_VIEW: "/project/view",
  PROJECT_DOWNLOAD: "/project/download",
  PROJECT_UPDATE: "/project/edit",
  PROJECT_DELETE: "/project/delete",

  // Admin
  PROJECTS_PENDING: "/project/admin/pending-projects",
  PROJECT_APPROVE: "/project/admin/approve",
  PROJECT_REJECT: "/project/admin/reject",
  DASHBOARD_STATS: "/project/dashboard/stats",
};

// Theme configuration
export const THEME_CONFIG = {
  colors: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      900: "#1e3a8a",
    },
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
  },
};

// Pagination configuration
export const PAGINATION_CONFIG = {
  defaultPage: 1,
  defaultLimit: APP_CONFIG.defaultPageSize,
  maxLimit: APP_CONFIG.maxPageSize,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
};

// File upload configuration
export const UPLOAD_CONFIG = {
  maxSize: APP_CONFIG.maxFileSize,
  allowedTypes: APP_CONFIG.allowedFileTypes,
  chunkSize: 1024 * 1024, // 1MB chunks for large files
  timeout: 300000, // 5 minutes
};

// Cache configuration
export const CACHE_CONFIG = {
  duration: APP_CONFIG.cacheDuration,
  keys: {
    projects: "projects",
    user: "user",
    stats: "stats",
  },
};

export default {
  APP_CONFIG,
  USER_ROLES,
  PROJECT_STATUS,
  VALIDATION_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  API_ENDPOINTS,
  THEME_CONFIG,
  PAGINATION_CONFIG,
  UPLOAD_CONFIG,
  CACHE_CONFIG,
  formatFileSize,
  formatDate,
};
