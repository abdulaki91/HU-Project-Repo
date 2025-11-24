import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { Button } from "../components/Button";
import { useTheme } from "../components/ThemeProvider";
import { useNavigate } from "react-router-dom";

export function Sidebar({
  currentPage,
  isOpen,
  onToggle,
  onLogout,
  setIsOpen,
}) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "upload", label: "Upload Project", icon: Upload },
    { id: "browse", label: "Browse Projects", icon: FolderSearch },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
  ];

  const handleNavigate = (id) => {
    navigate(id);
    if (window.innerWidth < 768) setIsOpen(false); // auto-hide on mobile/tablet
  };

  return (
    <>
      {/* Hamburger button for mobile/tablet */}
      <>
        {isOpen ? (
          <button
            variant="ghost"
            size="icon"
            className={`fixed top-2 max-sm:left-12 sm:left-20 z-50 md:left-28 lg:hidden dark:text-white ${
              !isOpen && "left-0.5"
            }`}
            onClick={onToggle}
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
          </button>
        ) : (
          <button
            variant="ghost"
            size="icon"
            className={`fixed top-2 ml-4  dark:text-white ${
              !isOpen && "left-0.5"
            }`}
            onClick={onToggle}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
          </button>
        )}
      </>
      {/* Sidebar */}
      {isOpen && (
        <aside
          className={`
          fixed top-0 left-0 w-20 sm:w-28 md:w-36 lg:w-64 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
          transform transition-transform duration-300 z-40
          md:translate-x-0
        `}
        >
          <div className="flex flex-col h-full gap-2">
            {/* Logo */}
            <div className="p-4 max-md:hidden  sm:p-6 lg:flex border-b md:mb-4 border-slate-200 dark:border-slate-700 items-center gap-2">
              <div className="w-10 h-10 sm:w-10 sm:h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm md:text-base lg:text-lg">
                  HUPR
                </span>
              </div>
              <div>
                <h1 className="text-slate-900 dark:text-white text-sm sm:text-base md:text-lg lg:text-xl">
                  HU Project Repo
                </h1>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 sm:p-4 max-sm:mt-10 md:mt-1 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 text-xs sm:text-base md:text-lg lg:text-xl px-3 py-2 sm:px-4 sm:py-3 rounded-lg transition-colors cursor-pointer
                    ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Theme & Logout */}
            <div className="p-2 sm:p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex gap-2 flex-col md:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />{" "}
                      Dark
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />{" "}
                      Light
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="flex-1 text-xs sm:text-sm md:text-base lg:text-lg 
             px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 
             dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 
             flex items-center justify-center gap-1 sm:gap-2"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  <span className="hidden xs:inline sm:inline md:inline lg:inline">
                    Logout
                  </span>
                </Button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white text-xs sm:text-sm md:text-base lg:text-lg">
                    John Doe
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs md:text-sm lg:text-base">
                    Student
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
