import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequireSuperAdmin = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Wait for React Query to finish fetching
  if (isLoading) {
    return <div className="p-6 text-center text-lg">Loading...</div>;
  }

  // No user after loading → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not super-admin → unauthorized
  if (user.role !== "super-admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Allowed
  return children;
};
