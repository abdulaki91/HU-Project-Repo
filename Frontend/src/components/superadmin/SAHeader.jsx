import { Button } from "../../components/Button";
import { useTheme } from "../../components/ThemeProvider";
import { Sun, Moon, Plus } from "lucide-react";

export const SAHeader = ({ onOpenModal }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Super Admin Dashboard
      </h1>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Create Admin Button */}
        <Button onClick={onOpenModal} className="flex items-center gap-2">
          <Plus size={18} /> Create Admin
        </Button>
      </div>
    </div>
  );
};
