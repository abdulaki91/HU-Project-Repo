import { useCallback } from "react";
import { toast } from "react-toastify";
import { ERROR_MESSAGES } from "../utils/constants";

export const useErrorHandler = () => {
  const handleError = useCallback((error) => {
    console.error("Error occurred:", error);

    let message = ERROR_MESSAGES.SERVER_ERROR;
    let title = "Error";

    if (error?.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          message = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
          title = "Validation Error";
          break;
        case 401:
          message = data?.message || ERROR_MESSAGES.UNAUTHORIZED;
          title = "Unauthorized";
          break;
        case 403:
          message = data?.message || ERROR_MESSAGES.FORBIDDEN;
          title = "Access Denied";
          break;
        case 404:
          message = data?.message || ERROR_MESSAGES.NOT_FOUND;
          title = "Not Found";
          break;
        case 409:
          message = data?.message || "Conflict occurred";
          title = "Conflict";
          break;
        case 413:
          message = data?.message || ERROR_MESSAGES.FILE_TOO_LARGE;
          title = "File Too Large";
          break;
        case 429:
          message =
            data?.message || "Too many requests. Please try again later.";
          title = "Rate Limited";
          break;
        case 500:
        default:
          message = data?.message || ERROR_MESSAGES.SERVER_ERROR;
          title = "Server Error";
          break;
      }
    } else if (error?.request) {
      message = ERROR_MESSAGES.NETWORK_ERROR;
      title = "Network Error";
    } else if (error?.message) {
      message = error.message;
    }

    // Show toast notification
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    return {
      title,
      message,
      status: error?.response?.status,
      code: error?.response?.data?.code,
    };
  }, []);

  const handleSuccess = useCallback((message, options = {}) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  const handleWarning = useCallback((message, options = {}) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  const handleInfo = useCallback((message, options = {}) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
};

export default useErrorHandler;
