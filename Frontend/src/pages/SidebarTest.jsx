import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { User } from "lucide-react";

export function SidebarTest() {
  const [testUser] = useState({
    firstName: "Ahmed",
    lastName: "Hassan",
    email: "ahmed.hassan@haramaya.edu.et",
    department: "Computer Science",
    role: "admin",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Sidebar User Display Test</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large Screen Layout */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Large Screen (lg:)</h3>
              <div className="w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-900 dark:text-white text-sm font-medium truncate">
                      {testUser.firstName} {testUser.lastName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs truncate">
                      {testUser.department}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs truncate">
                      {testUser.email}
                    </div>
                    <div className="text-slate-500 capitalize dark:text-slate-400 text-xs">
                      {testUser.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Screen Layout */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Medium Screen (md:)</h3>
              <div className="w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-900 dark:text-white text-xs font-medium truncate">
                      {testUser.firstName}
                    </div>
                    <div className="text-slate-500 capitalize dark:text-slate-400 text-[10px] truncate">
                      {testUser.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Screen Layout */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Small Screen (sm:)</h3>
              <div className="w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-900 dark:text-white text-xs font-medium truncate">
                      {testUser.firstName}
                    </div>
                    <div className="text-slate-500 capitalize dark:text-slate-400 text-[10px] truncate">
                      {testUser.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Improvements Made:
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>• Responsive user info display based on screen size</li>
              <li>• Proper text truncation to prevent overflow</li>
              <li>
                • Compact view on smaller screens (shows only name and role)
              </li>
              <li>
                • Full details on large screens (name, department, email, role)
              </li>
              <li>• Better spacing and typography</li>
              <li>• Fixed sidebar width for better content display</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Current User Data:
            </h4>
            <pre className="text-sm text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
              {JSON.stringify(testUser, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}
