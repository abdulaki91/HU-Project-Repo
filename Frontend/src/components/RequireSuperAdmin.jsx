import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequireSuperAdmin = ({ children }) => {
  const { user } = useAuth();

  // Not logged in → redirect
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but NOT super admin → not authorized page
  if (user.role !== "super-admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Allow access
  return children;
};
