import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useState, useEffect } from "react";

export function Layout({ onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Check if mobile screen with better breakpoint
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // Changed from 768 to 1024 for better tablet support
      setIsMobile(mobile);

      if (mobile) {
        // On mobile/tablet, sidebar is closed by default
        setIsSidebarOpen(false);
        setIsCollapsed(false);
      } else {
        // On desktop, sidebar is open by default
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isSidebarOpen]);

  // Calculate main content margin based on sidebar state
  const getMainContentMargin = () => {
    if (isMobile) {
      // On mobile, always account for the icon-only sidebar (20px width)
      return "ml-20";
    }

    if (!isSidebarOpen) {
      return "ml-0"; // Sidebar hidden on desktop
    }

    return isCollapsed ? "ml-20" : "ml-72"; // Collapsed or expanded sidebar
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors overflow-hidden">
      <Sidebar
        currentPage={location.pathname}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main
        className={`
          flex-1 overflow-auto transition-all duration-300 ease-in-out
          ${getMainContentMargin()}
        `}
      >
        <div className="min-h-full">
          {/* Content Padding - Better mobile spacing */}
          <div
            className={`
            p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto
            ${isMobile ? "pt-20" : "pt-6"}
          `}
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
