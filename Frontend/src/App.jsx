import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ThemeProvider";
import { ToastProvider } from "./components/Toast";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";

// Pages
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { HomePage } from "./pages/HomePage";
import { UploadProject } from "./pages/UploadProject";
import { BrowseProjects } from "./pages/BrowseProjects";
import { PendingProjects } from "./pages/PendingProjects";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { MyProjects } from "./pages/MyProjects";
import { Settings } from "./pages/Settings";
import { PageNotFound } from "./pages/PgaeNotFound";
import { Unauthorized } from "./pages/Unauthorized";

// Route guards
import { PrivateRoute } from "./components/PrivateRoute";
import { RequireSuperAdmin } from "./components/RequireSuperAdmin";
import { RequireAdmin } from "./components/RequireAdmin";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
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

                    {/* Admin and Super Admin routes */}
                    <Route
                      path="/pending"
                      element={
                        <RequireAdmin>
                          <PendingProjects />
                        </RequireAdmin>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <RequireAdmin>
                          <Dashboard />
                        </RequireAdmin>
                      }
                    />

                    {/* User profile routes */}
                    <Route path="/profile" element={<Profile />}>
                      <Route index element={<MyProjects />} />
                      <Route path="projects" element={<MyProjects />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                  </Route>
                  {/* Fallback route */}
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              </Router>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
