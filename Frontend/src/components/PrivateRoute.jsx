import { Navigate } from "react-router-dom";

export function PrivateRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    // If user is not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }
  // If authenticated, render the children (the protected page)
  return children;
}
