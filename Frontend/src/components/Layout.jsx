import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

export function Layout({ onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={onLogout}
      />
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ${
          isSidebarOpen ? "ml-16 sm:ml-24 md:ml-32  lg:ml-64" : "p-4 lg:ml-64"
        }`}
      >
        <div className="p-6 md:p-8 max-w-[1400px] mx-auto ">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
