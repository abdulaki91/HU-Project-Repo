import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequireAdmin = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Wait for React Query to finish fetching
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // No user after loading → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin or super-admin → unauthorized
  if (user.role !== "admin" && user.role !== "super-admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Allowed
  return children;
};

export default RequireAdmin;
