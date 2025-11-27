import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Layout } from "./components/Layout";

// Pages
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { HomePage } from "./pages/HomePage";
import { UploadProject } from "./pages/UploadProject";
import { BrowseProjects } from "./pages/BrowseProjects";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { PageNotFound } from "./pages/PgaeNotFound";
import { Unauthorized } from "./pages/Unauthorized";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";

// Route guards
import { PrivateRoute } from "./components/PrivateRoute";
import { RequireSuperAdmin } from "./components/RequireSuperAdmin";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Private routes inside Layout */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadProject />} />
            <Route path="/browse" element={<BrowseProjects />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Super Admin Route */}
          <Route
            path="/super-admin"
            element={
              <RequireSuperAdmin>
                <SuperAdminDashboard />
              </RequireSuperAdmin>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
