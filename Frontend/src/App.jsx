import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { PageNotFound } from "./pages/PgaeNotFound";
export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

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

          {/* Fallback route */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
