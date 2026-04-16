import { Card } from "../components/Card";
import { User } from "lucide-react";

export function TextContrastTest() {
  const testUser = {
    firstName: "Ahmed",
    lastName: "Hassan",
    department: "Computer Science",
    role: "admin",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Text Contrast Test</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Light Mode Test */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Light Mode</h3>
              <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-xl p-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-300 shadow-md">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                      {testUser.firstName?.[0] || "U"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900 truncate drop-shadow-sm">
                      {testUser.firstName} {testUser.lastName}
                    </div>
                    <div className="text-xs text-slate-700 truncate font-medium">
                      {testUser.department}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 text-xs rounded-full font-semibold shadow-sm bg-blue-200 text-blue-900">
                        {testUser.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Mode Test */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dark Mode</h3>
              <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-600 shadow-md">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                      {testUser.firstName?.[0] || "U"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate drop-shadow-sm">
                      {testUser.firstName} {testUser.lastName}
                    </div>
                    <div className="text-xs text-slate-200 truncate font-medium">
                      {testUser.department}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 text-xs rounded-full font-semibold shadow-sm bg-blue-800 text-blue-100">
                        {testUser.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Text Contrast Improvements:
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>
                • <strong>User Name:</strong> font-bold text-slate-900 (light) /
                text-white (dark) with drop-shadow
              </li>
              <li>
                • <strong>Department:</strong> font-medium text-slate-700
                (light) / text-slate-200 (dark)
              </li>
              <li>
                • <strong>Role Badge:</strong> Higher contrast with solid
                backgrounds and font-semibold
              </li>
              <li>
                • <strong>Background:</strong> Solid bg-white/bg-slate-800 with
                stronger borders
              </li>
              <li>
                • <strong>Enhanced Shadow:</strong> Added shadow-md for better
                depth and definition
              </li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Color Values Used:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Light Mode:
                </h5>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                  <li>
                    • Name:{" "}
                    <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
                      font-bold text-slate-900 drop-shadow-sm
                    </code>
                  </li>
                  <li>
                    • Department:{" "}
                    <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
                      font-medium text-slate-700
                    </code>
                  </li>
                  <li>
                    • Background:{" "}
                    <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
                      bg-white border-slate-300
                    </code>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Dark Mode:
                </h5>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                  <li>
                    • Name:{" "}
                    <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
                      font-bold text-white drop-shadow-sm
                    </code>
                  </li>
                  <li>
                    • Department:{" "}
                    <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
                      font-medium text-slate-200
                    </code>
                  </li>
                  <li>
                    • Background:{" "}
                    <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
                      bg-slate-800 border-slate-600
                    </code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
