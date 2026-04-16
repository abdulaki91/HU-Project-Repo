import { useState, useEffect, createContext, useContext } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: "info",
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const toast = {
    success: (message, options = {}) =>
      addToast({ ...options, type: "success", message }),
    error: (message, options = {}) =>
      addToast({ ...options, type: "error", message, duration: 7000 }),
    warning: (message, options = {}) =>
      addToast({ ...options, type: "warning", message }),
    info: (message, options = {}) =>
      addToast({ ...options, type: "info", message }),
    loading: (message, options = {}) =>
      addToast({ ...options, type: "loading", message, duration: 0 }),
    custom: (component, options = {}) => addToast({ ...options, component }),
    dismiss: removeToast,
    dismissAll: removeAllToasts,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "loading":
        return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          bg: "bg-white dark:bg-slate-800",
          border:
            "border-l-4 border-l-emerald-500 border-emerald-200 dark:border-emerald-800",
          shadow: "shadow-lg shadow-emerald-500/10",
          accent: "bg-emerald-500",
        };
      case "error":
        return {
          bg: "bg-white dark:bg-slate-800",
          border:
            "border-l-4 border-l-red-500 border-red-200 dark:border-red-800",
          shadow: "shadow-lg shadow-red-500/10",
          accent: "bg-red-500",
        };
      case "warning":
        return {
          bg: "bg-white dark:bg-slate-800",
          border:
            "border-l-4 border-l-amber-500 border-amber-200 dark:border-amber-800",
          shadow: "shadow-lg shadow-amber-500/10",
          accent: "bg-amber-500",
        };
      case "info":
        return {
          bg: "bg-white dark:bg-slate-800",
          border:
            "border-l-4 border-l-blue-500 border-blue-200 dark:border-blue-800",
          shadow: "shadow-lg shadow-blue-500/10",
          accent: "bg-blue-500",
        };
      case "loading":
        return {
          bg: "bg-white dark:bg-slate-800",
          border:
            "border-l-4 border-l-indigo-500 border-indigo-200 dark:border-indigo-800",
          shadow: "shadow-lg shadow-indigo-500/10",
          accent: "bg-indigo-500",
        };
      default:
        return {
          bg: "bg-white dark:bg-slate-800",
          border: "border-gray-200 dark:border-slate-700",
          shadow: "shadow-lg",
          accent: "bg-gray-500",
        };
    }
  };

  const styles = getStyles();

  if (toast.component) {
    return (
      <div
        className={`transform transition-all duration-500 ease-out pointer-events-auto ${
          isVisible && !isLeaving
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }`}
      >
        {toast.component}
      </div>
    );
  }

  return (
    <div
      className={`transform transition-all duration-500 ease-out pointer-events-auto ${
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      }`}
    >
      <div
        className={`
          relative p-4 rounded-xl backdrop-blur-sm
          ${styles.bg} ${styles.border} ${styles.shadow}
          hover:shadow-xl transition-shadow duration-200
        `}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">
                {toast.title}
              </h4>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {toast.message}
            </p>
            {toast.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                {toast.description}
              </p>
            )}
          </div>

          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 group"
          >
            <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>
        </div>

        {/* Progress bar for timed toasts */}
        {toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-slate-700 rounded-b-xl overflow-hidden">
            <div
              className={`h-full ${styles.accent} animate-progress opacity-60`}
              style={{
                animationDuration: `${toast.duration}ms`,
                animationTimingFunction: "linear",
              }}
            />
          </div>
        )}

        {/* Subtle glow effect */}
        <div
          className={`absolute inset-0 rounded-xl ${styles.shadow} opacity-20 -z-10`}
        />
      </div>
    </div>
  );
}

// Enhanced CSS for progress animation and effects
const enhancedStyles = `
  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
    to {
      transform: translateX(100%) scale(0.95);
      opacity: 0;
    }
  }
  
  .animate-progress {
    animation: progress linear forwards;
  }
  
  .animate-slide-in {
    animation: slideInRight 0.5s ease-out forwards;
  }
  
  .animate-slide-out {
    animation: slideOutRight 0.3s ease-in forwards;
  }
`;

// Inject enhanced styles only once
if (
  typeof document !== "undefined" &&
  !document.querySelector("#enhanced-toast-styles")
) {
  const style = document.createElement("style");
  style.id = "enhanced-toast-styles";
  style.textContent = enhancedStyles;
  document.head.appendChild(style);
}
