import axios from "axios";
// import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

let isLoggingOut = false; // ✅ Prevent duplicate toasts & redirects

// Add token before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Catch expired/invalid token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    const url = error.config?.url || "";

    // Do NOT auto-logout on login failure
    if (url.includes("/user/login")) {
      return Promise.reject(error);
    }

    // ✅ Auto logout only for expired session
    if (status === 401 && message.toLowerCase().includes("expired")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


export default api;
