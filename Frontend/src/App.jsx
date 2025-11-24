import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Layout } from "./components/Layout";

import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { HomePage } from "./pages/HomePage";
import { UploadProject } from "./pages/UploadProject";
import { BrowseProjects } from "./pages/BrowseProjects";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { PrivateRoute } from "./components/PrivateRoute";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(1);
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={<Login onLogin={() => setIsAuthenticated(true)} />}
          />
          <Route
            path="/signup"
            element={<SignUp onSignUp={() => setIsAuthenticated(true)} />}
          />

          {/* Private routes inside Layout */}
          <Route
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Layout onLogout={() => setIsAuthenticated(false)} />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadProject />} />
            <Route path="/browse" element={<BrowseProjects />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
