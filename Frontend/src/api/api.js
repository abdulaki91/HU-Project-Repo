import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:8000/api", //https://attendio-backend.abdiko.com  //http://localhost:8000/api
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
    if (error.response) {
      const message = error.response.data?.message;

      // Handle expired token or unauthorized
      if (
        !isLoggingOut &&
        (message?.toLowerCase().includes("expired") ||
          error.response.status === 401)
      ) {
        isLoggingOut = true; // ✅ Prevent multiple runs
        toast.error(message || "Session expired, please log in again");

        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
          isLoggingOut = false; // reset for future sessions
        }, 2000);
      } else if (message) {
        toast.error(message);
      }
    } else {
      toast.error("Network error. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default api;
