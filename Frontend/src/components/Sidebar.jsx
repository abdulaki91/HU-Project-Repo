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
import "./Sidebar.css";

export function Sidebar({
  currentPage,
  isOpen,
  onToggle,
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
  isMobile,
  onLogout,
}) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const logoutUser = () => {
    logout();
    navigate("/login");
    if (onLogout) onLogout();
  };

  // Handle mobile touch events
  const handleTouchStart = (e) => {
    if (isMobile && isOpen) {
      e.stopPropagation();
    }
  };

  const handleOverlayClick = (e) => {
    if (isMobile && isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
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
    // Always close sidebar on mobile after navigation
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  };

  const toggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Improved responsive width calculation
  const getSidebarClasses = () => {
    const baseClasses = `
      fixed top-0 left-0 h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
      border-r border-slate-200/50 dark:border-slate-700/50 z-50
      transform transition-all duration-300 ease-in-out
    `;

    if (isMobile) {
      // On mobile, use icon-only width when closed, full width when open
      const width = isOpen ? "w-80" : "w-20";
      return `${baseClasses} ${width} shadow-2xl ${
        isOpen ? "translate-x-0" : "translate-x-0"
      }`;
    }

    // Desktop behavior
    const width = isCollapsed ? "w-20" : "w-72";
    return `${baseClasses} ${width} shadow-lg translate-x-0`;
  };

  return (
    <>
      {/* Mobile Overlay - Enhanced for better touch handling */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleOverlayClick}
          onTouchStart={handleTouchStart}
          style={{ touchAction: "none" }}
        />
      )}

      {/* Mobile Toggle Button - Better positioning */}
      {isMobile && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 lg:hidden hover:bg-white dark:hover:bg-slate-800 transition-all duration-200"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? (
            <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          ) : (
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          )}
        </button>
      )}

      {/* Sidebar */}
      <aside className={getSidebarClasses()} onTouchStart={handleTouchStart}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              {/* Modern Logo Icon */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300">
                  {/* University Icon */}
                  <div className="relative">
                    {(isCollapsed && !isMobile) || (isMobile && !isOpen) ? (
                      <span className="text-white text-xl font-black tracking-tight">
                        U
                      </span>
                    ) : (
                      <div className="flex flex-col items-center">
                        {/* Building/University Symbol */}
                        <div className="flex space-x-0.5 mb-1">
                          <div className="w-1 h-2 bg-white rounded-sm"></div>
                          <div className="w-1 h-3 bg-white rounded-sm"></div>
                          <div className="w-1 h-2 bg-white rounded-sm"></div>
                        </div>
                        {/* Base */}
                        <div className="w-4 h-0.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Accent dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
              </div>

              {/* Logo Text */}
              {((!isCollapsed && !isMobile) || (isMobile && isOpen)) && (
                <div className="flex flex-col">
                  {/* Main Title */}
                  <div className="flex items-center gap-1">
                    <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent tracking-tight">
                      UPSHU
                    </h1>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                      Project Store
                    </span>
                  </div>

                  {/* Subtitle */}
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                      Academic Excellence Hub
                    </p>
                    <div className="w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                  </div>

                  {/* University Name */}
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                    University of People's Solidarity for Haramaya University
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Collapse Button */}
            {!isMobile && (
              <button
                onClick={toggleCollapse}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronLeft
                  className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${
                    isCollapsed ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}

            {/* Mobile Close Button - only show when open */}
            {isMobile && isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                    group relative overflow-hidden touch-manipulation touch-target sidebar-transition
                    ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white active:bg-slate-200 dark:active:bg-slate-700"
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

                  {/* Tooltip for collapsed state */}
                  {((isCollapsed && !isMobile) || (isMobile && !isOpen)) && (
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

              {((!isCollapsed && !isMobile) || (isMobile && isOpen)) && (
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
              ${(isCollapsed && !isMobile) || (isMobile && !isOpen) ? "flex-col" : "flex-row"}
            `}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className={`
                  flex items-center justify-center gap-2 flex-1 touch-manipulation touch-target sidebar-transition
                  bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700
                  hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600
                  ${(isCollapsed && !isMobile) || (isMobile && !isOpen) ? "px-2" : "px-3"}
                `}
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
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
                className={`
                  flex items-center justify-center gap-2 flex-1 touch-manipulation touch-target sidebar-transition
                  bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700
                  hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600
                  ${(isCollapsed && !isMobile) || (isMobile && !isOpen) ? "px-2" : "px-3"}
                `}
              >
                <Settings className="h-4 w-4" />
                {((!isCollapsed && !isMobile) || (isMobile && isOpen)) && (
                  <span className="text-xs">Settings</span>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={logoutUser}
                className={`
                  flex items-center justify-center gap-2 flex-1 touch-manipulation touch-target sidebar-transition
                  bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800
                  text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30
                  active:bg-red-200 dark:active:bg-red-900/40
                  ${(isCollapsed && !isMobile) || (isMobile && !isOpen) ? "px-2" : "px-3"}
                `}
              >
                <LogOut className="h-4 w-4" />
                {((!isCollapsed && !isMobile) || (isMobile && isOpen)) && (
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
