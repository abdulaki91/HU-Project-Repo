import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 300000, // 5 minutes timeout for large file uploads
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const code = error.response?.data?.code;
    const url = error.config?.url || "";

    // Don't auto-logout on login/register failures
    if (url.includes("/user/login") || url.includes("/user/register")) {
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (status === 401) {
      if (
        code === "TOKEN_EXPIRED" ||
        message.toLowerCase().includes("expired")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login?expired=true";
      } else if (code === "INVALID_TOKEN") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login?invalid=true";
      }
    }

    // Handle rate limiting
    if (status === 429) {
      console.warn("Rate limit exceeded:", message);
    }

    // Handle server errors
    if (status >= 500) {
      console.error("Server error:", message);
    }

    return Promise.reject({
      ...error,
      message,
      code,
      status,
    });
  },
);

// API methods for better organization
export const authAPI = {
  register: (userData) => api.post("/user/register", userData),
  login: (credentials) => api.post("/user/login", credentials),
  logout: () => api.post("/user/logout"),
  forgotPassword: (email) => api.post("/user/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post(`/user/reset-password/${token}`, { password }),
  refreshToken: (refreshToken) =>
    api.post("/user/refresh-token", { refreshToken }),
  getProfile: () => api.get("/user/me"),
  updateProfile: (id, data) => api.put(`/user/update/${id}`, data),
  changePassword: (data) => api.put("/user/change-password", data),
};

export const projectAPI = {
  // Public endpoints
  browse: (params) => api.get("/project/browse", { params }),
  search: (params) => api.get("/project/search", { params }),
  getById: (id) => api.get(`/project/${id}`),
  getTrending: (params) => api.get("/project/trending", { params }),
  getFeatured: (params) => api.get("/project/featured", { params }),
  getRelated: (id, params) => api.get(`/project/${id}/related`, { params }),

  // User endpoints
  getMyProjects: (params) => api.get("/project/my/projects", { params }),
  getUserProjects: (params) => api.get("/project/user/projects", { params }),
  create: (formData) =>
    api.post("/project/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 600000, // 10 minutes for file uploads
    }),
  update: (id, data) => api.put(`/project/update/${id}`, data),
  delete: (id) => api.delete(`/project/delete/${id}`),
  download: (id) =>
    api.get(`/project/download/${id}`, { responseType: "blob" }),

  // Admin endpoints
  getPending: (params) => api.get("/project/admin/pending", { params }),
  updateStatus: (id, data) => api.put(`/project/admin/status/${id}`, data),
  toggleFeatured: (id, featured) =>
    api.put(`/project/admin/featured/${id}`, { featured }),
  bulkUpdateStatus: (data) => api.post("/project/admin/bulk-status", data),
  getStats: () => api.get("/project/admin/stats"),
};

export const userAPI = {
  search: (params) => api.get("/user/search", { params }),
  getStats: () => api.get("/user/stats"),
  getActivity: (id) => api.get(`/user/activity/${id || ""}`),
  getList: (params) => api.get("/user/list", { params }),
  updateStatus: (id, status) => api.put(`/user/status/${id}`, { status }),
  deleteAccount: (id) => api.delete(`/user/account/${id}`),
};

// Utility functions
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, { responseType: "blob" });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
};

export const uploadWithProgress = (url, formData, onProgress) => {
  return api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 600000, // 10 minutes for file uploads
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percentCompleted);
      }
    },
  });
};

export default api;
