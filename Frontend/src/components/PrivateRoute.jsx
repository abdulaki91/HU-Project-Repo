import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PrivateRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="text-center mt-20">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
