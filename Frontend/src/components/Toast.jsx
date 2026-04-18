import { createContext, useContext } from "react";
import { toast } from "react-toastify";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const showToast = {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    info: (message) => toast.info(message),
    warning: (message) => toast.warning(message),
  };

  return (
    <ToastContext.Provider value={showToast}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
