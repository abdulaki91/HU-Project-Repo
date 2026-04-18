import { Card } from "../Card";
import { Badge } from "../Badge";
import { Users, TrendingUp, Download, Eye, Calendar } from "lucide-react";

export function StudentActivityTable({ studentActivity, isLoading }) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Student Activity
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!studentActivity || studentActivity.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Student Activity
          </h3>
        </div>
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No student activity data available
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Student Activity Summary
        </h3>
        <Badge variant="secondary" className="ml-auto">
          {studentActivity.length} Students
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                Student
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                Batch
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                Projects
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                Status
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                Engagement
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                Last Upload
              </th>
            </tr>
          </thead>
          <tbody>
            {studentActivity.map((student, index) => (
              <tr
                key={student.email}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-4 px-2">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {student.email}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <Badge variant="outline" className="text-xs">
                    {student.batch || "N/A"}
                  </Badge>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {student.total_projects || 0}
                    </span>
                    <div className="flex gap-1">
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {student.approved_projects || 0}A
                      </span>
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        {student.pending_projects || 0}P
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  {student.total_projects > 0 ? (
                    <Badge
                      className={
                        student.approved_projects > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                          : student.pending_projects > 0
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
                      }
                    >
                      {student.approved_projects > 0
                        ? "Active"
                        : student.pending_projects > 0
                          ? "Pending"
                          : "Inactive"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500">
                      No Projects
                    </Badge>
                  )}
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="flex items-center justify-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                      <Download className="h-3 w-3" />
                      {student.total_downloads || 0}
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <Eye className="h-3 w-3" />
                      {student.total_views || 0}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  {student.last_upload ? (
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(student.last_upload).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Never</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {studentActivity.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No students found in this department
          </p>
        </div>
      )}
    </Card>
  );
}