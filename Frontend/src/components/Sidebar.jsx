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
import { Button } from "../components/Button";
import { useTheme } from "../components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export function Sidebar({ currentPage, isOpen, onToggle, setIsOpen }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile screen
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(false); // Always expanded on mobile when open
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const logoutUser = () => {
    logout();
    navigate("/login");
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
    // Admin and Super Admin can see pending projects
    ...(user?.role === "admin" || user?.role === "super-admin"
      ? [
          {
            id: "pending",
            label: "Pending Projects",
            icon: FileText,
            description: "Review submissions",
          },
        ]
      : []),
    // Admin and Super Admin can see dashboard
    ...(user?.role === "admin" || user?.role === "super-admin"
      ? [
          {
            id: "dashboard",
            label: "Analytics",
            icon: BarChart3,
            description: "View insights",
          },
        ]
      : []),
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage account",
    },
  ];

  const handleNavigate = (id) => {
    navigate(id);
    if (isMobile) {
      setIsOpen(false); // Auto-hide on mobile
    }
  };

  const toggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const sidebarWidth = isMobile ? "w-80" : isCollapsed ? "w-20" : "w-72";

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 md:hidden"
        >
          {isOpen ? (
            <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          ) : (
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          )}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
          border-r border-slate-200/50 dark:border-slate-700/50 z-50
          transform transition-all duration-300 ease-in-out
          ${sidebarWidth}
          ${isOpen || !isMobile ? "translate-x-0" : "-translate-x-full"}
          ${isMobile ? "shadow-2xl" : "shadow-lg"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">
                  {isCollapsed && !isMobile ? "H" : "HUPS"}
                </span>
              </div>
              {(!isCollapsed || isMobile) && (
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                    HU Project Store
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
                onClick={toggleCollapse}
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
                  onClick={() => handleNavigate(item.id)}
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

                  {(!isCollapsed || isMobile) && (
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

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobile && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45"></div>
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
              className={`
              flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 mb-4 shadow-md
              ${isCollapsed && !isMobile ? "justify-center" : ""}
            `}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {user?.firstName?.[0] || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
              </div>

              {(!isCollapsed || isMobile) && (
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate drop-shadow-sm">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.name || "User Name"}
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-200 truncate font-medium">
                    {user?.department || "Department"}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`
                      px-2 py-0.5 text-xs rounded-full font-semibold shadow-sm
                      ${
                        user?.role === "super-admin"
                          ? "bg-purple-200 text-purple-900 dark:bg-purple-800 dark:text-purple-100"
                          : user?.role === "admin"
                            ? "bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100"
                            : "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100"
                      }
                    `}
                    >
                      {user?.role || "Role"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              className={`
              flex gap-2
              ${isCollapsed && !isMobile ? "flex-col" : "flex-row"}
            `}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className={`
                  flex items-center justify-center gap-2 flex-1
                  bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700
                  hover:bg-slate-100 dark:hover:bg-slate-700
                  ${isCollapsed && !isMobile ? "px-2" : "px-3"}
                `}
              >
                {theme === "light" ? (
                  <>
                    <Moon className="h-4 w-4" />
                    {(!isCollapsed || isMobile) && (
                      <span className="text-xs">Dark</span>
                    )}
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4" />
                    {(!isCollapsed || isMobile) && (
                      <span className="text-xs">Light</span>
                    )}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
                className={`
                  flex items-center justify-center gap-2 flex-1
                  bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700
                  hover:bg-slate-100 dark:hover:bg-slate-700
                  ${isCollapsed && !isMobile ? "px-2" : "px-3"}
                `}
              >
                <Settings className="h-4 w-4" />
                {(!isCollapsed || isMobile) && (
                  <span className="text-xs">Settings</span>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={logoutUser}
                className={`
                  flex items-center justify-center gap-2 flex-1
                  bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800
                  text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30
                  ${isCollapsed && !isMobile ? "px-2" : "px-3"}
                `}
              >
                <LogOut className="h-4 w-4" />
                {(!isCollapsed || isMobile) && (
                  <span className="text-xs">Logout</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
