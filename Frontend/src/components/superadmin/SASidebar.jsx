import { Home, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../ThemeProvider";

export const SASidebar = () => {
  const { logout } = useAuth();
  const { theme } = useTheme(); // dark/light mode
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`w-64 hidden md:flex flex-col p-6 rounded-xl shadow-xl
        transition-colors duration-300
        ${
          theme === "light"
            ? "bg-gradient-to-b from-indigo-50 via-white to-purple-50 border border-gray-200"
            : "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 border border-gray-700"
        }`}
    >
      <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-10">
        Super Admin
      </h1>

      <nav className="flex-1 space-y-3">
        <SidebarItem
          icon={<Home size={18} />}
          label="Dashboard"
          to="/super-admin"
          active={isActive("/super-admin")}
          theme={theme}
        />
        <SidebarItem
          icon={<Users size={18} />}
          label="Manage Admins"
          to="/super-admin/manage-admins"
          active={isActive("/super-admin/manage-admins")}
          theme={theme}
        />
        <SidebarItem
          icon={<Settings size={18} />}
          label="Settings"
          to="/super-admin/settings"
          active={isActive("/super-admin/settings")}
          theme={theme}
        />
      </nav>

      <button
        onClick={logout}
        className={`mt-6 flex items-center gap-3 p-3 rounded-lg font-semibold
          transition-colors duration-300
          ${
            theme === "light"
              ? "text-red-600 hover:bg-red-100"
              : "text-red-400 hover:bg-red-900/30"
          }
        `}
      >
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
};

const SidebarItem = ({ icon, label, to, active, theme }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 p-3 rounded-lg font-medium
      transition-colors duration-300
      ${
        theme === "light"
          ? active
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-700 hover:bg-indigo-50"
          : active
          ? "bg-indigo-600/30 text-indigo-200"
          : "text-gray-200 hover:bg-gray-700/50"
      }
    `}
  >
    {icon} {label}
  </Link>
);
