import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { ToastProvider } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import { useState, useEffect } from "react";
import {
  Home,
  Upload,
  FolderSearch,
  BarChart3,
  User,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  FileText,
  ChevronLeft,
  Settings,
} from "lucide-react";

// Simple Sidebar without Auth dependency
function SimpleSidebar({
  currentPage,
  isOpen,
  onToggle,
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
  isMobile,
}) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    document.documentElement.classList.toggle("dark");
  };

  const menuItems = [
    {
      id: "/",
      label: "Dashboard",
      icon: Home,
      description: "Overview and stats",
    },
    {
      id: "upload",
      label: "Upload Project",
      icon: Upload,
      description: "Share your work",
    },
    {
      id: "browse",
      label: "Browse Projects",
      icon: FolderSearch,
      description: "Explore projects",
    },
    {
      id: "pending",
      label: "Pending Projects",
      icon: FileText,
      description: "Review submissions",
    },
    {
      id: "dashboard",
      label: "Analytics",
      icon: BarChart3,
      description: "View insights",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage account",
    },
  ];

  const getSidebarClasses = () => {
    const baseClasses = `
      fixed top-0 left-0 h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
      border-r border-slate-200/50 dark:border-slate-700/50 z-50
      transform transition-all duration-300 ease-in-out
    `;

    if (isMobile) {
      const width = isOpen ? "w-80" : "w-20";
      return `${baseClasses} ${width} shadow-2xl translate-x-0`;
    }

    const width = isCollapsed ? "w-20" : "w-72";
    return `${baseClasses} ${width} shadow-lg translate-x-0`;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 lg:hidden hover:bg-white dark:hover:bg-slate-800 transition-all duration-200"
        >
          {isOpen ? (
            <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          ) : (
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          )}
        </button>
      )}

      {/* Sidebar */}
      <aside className={getSidebarClasses()}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              {/* Simple Logo Icon */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">
                  {(isCollapsed && !isMobile) || (isMobile && !isOpen)
                    ? "U"
                    : "UP"}
                </span>
              </div>

              {/* Simple Text */}
              {((!isCollapsed && !isMobile) || (isMobile && isOpen)) && (
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                    UPSHU Project Store
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Academic Excellence Hub
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Collapse Button */}
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronLeft
                  className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${
                    isCollapsed ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                    group relative overflow-hidden
                    ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : ""}`}
                  />

                  {((!isCollapsed && !isMobile) || (isMobile && isOpen)) && (
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div
                        className={`text-xs opacity-75 ${
                          isActive
                            ? "text-white/80"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
            {/* User Info */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 mb-4 shadow-md ${
                isCollapsed && !isMobile ? "justify-center" : ""
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  D
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
              </div>

              {((!isCollapsed && !isMobile) || (isMobile && isOpen)) && (
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    Demo User
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-200 truncate font-medium">
                    Computer Science
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 text-xs rounded-full font-semibold shadow-sm bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100">
                      student
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              className={`flex gap-2 ${
                (isCollapsed && !isMobile) || (isMobile && !isOpen)
                  ? "flex-col"
                  : "flex-row"
              }`}
            >
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                  (isCollapsed && !isMobile) || (isMobile && !isOpen)
                    ? "px-2"
                    : "px-3"
                }`}
              >
                {theme === "light" ? (
                  <>
                    <Moon className="h-4 w-4" />
                    {((!isCollapsed && !isMobile) || (isMobile && isOpen)) && (
                      <span className="text-xs">Dark</span>
                    )}
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4" />
                    {((!isCollapsed && !isMobile) || (isMobile && isOpen)) && (
                      <span className="text-xs">Light</span>
                    )}
                  </>
                )}
              </button>

              <button
                className={`flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                  (isCollapsed && !isMobile) || (isMobile && !isOpen)
                    ? "px-2"
                    : "px-3"
                }`}
              >
                <Settings className="h-4 w-4" />
                {((!isCollapsed && !isMobile) || (isMobile && isOpen)) && (
                  <span className="text-xs">Settings</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Demo Dashboard Page
function DemoDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
        setIsCollapsed(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <SimpleSidebar
        currentPage="/"
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          !isMobile && !isCollapsed
            ? "ml-72"
            : !isMobile && isCollapsed
              ? "ml-20"
              : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Welcome to UPSHU Project Store!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Demo Mode
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Total Projects
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    156
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    1,234
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Downloads
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    8,567
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Departments
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    12
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  ✅ Frontend Working Successfully!
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                  This demonstrates the UPSHU Project Store interface with the
                  simplified logo design. The frontend is working correctly
                  without requiring the backend server.
                </p>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p>
                    <strong>✅ Responsive Design:</strong> Works on mobile,
                    tablet, and desktop
                  </p>
                  <p>
                    <strong>✅ Theme Support:</strong> Light and dark mode
                    switching
                  </p>
                  <p>
                    <strong>✅ Clean Logo:</strong> Simple, professional UPSHU
                    branding
                  </p>
                  <p>
                    <strong>✅ No Backend Required:</strong> Frontend displays
                    independently
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="*" element={<DemoDashboard />} />
            </Routes>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
