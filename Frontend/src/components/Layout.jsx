import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useState, useEffect } from "react";

export function Layout({ onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if mobile screen
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, sidebar is open by default; on mobile, it's closed
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      <Sidebar
        currentPage={location.pathname}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        setIsOpen={setIsSidebarOpen}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main
        className={`
          flex-1 overflow-auto transition-all duration-300 ease-in-out
          ${!isMobile && isSidebarOpen ? "ml-72" : "ml-0"}
          ${!isMobile && !isSidebarOpen ? "ml-20" : ""}
        `}
      >
        <div className="min-h-full">
          {/* Content Padding */}
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
