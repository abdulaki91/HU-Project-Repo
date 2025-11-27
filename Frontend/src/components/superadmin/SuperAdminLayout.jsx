import { Link, Outlet } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../ThemeProvider";

export const SuperAdminLayout = () => {
  const { theme, toggleTheme } = useTheme(); // ← FIXED HERE

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-8">
          Super Admin
        </h1>

        <nav className="space-y-4">
          <Link
            to="/super-admin"
            className="block px-3 py-2 rounded-md font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Dashboard
          </Link>

          <Link
            to="/super-admin/manage-users"
            className="block px-3 py-2 rounded-md font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Manage Users
          </Link>

          <Link
            to="/super-admin/settings"
            className="block px-3 py-2 rounded-md font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Super Admin Panel
          </h2>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>

        {/* Page Content */}
        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
