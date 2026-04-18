import { Card } from "../Card";
import { Badge } from "../Badge";
import { Button } from "../Button";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  BookOpen,
} from "lucide-react";

export function AdminRecentProjects({
  recentProjects,
  isLoading,
  onViewProject,
}) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Department Projects
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!recentProjects || recentProjects.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Department Projects
          </h3>
        </div>
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No recent projects in your department
          </p>
        </div>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Department Projects
          </h3>
        </div>
        <Badge variant="secondary">{recentProjects.length} Projects</Badge>
      </div>

      <div className="space-y-4">
        {recentProjects.map((project) => (
          <div
            key={project.id}
            className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-slate-900 dark:text-white truncate">
                    {project.title}
                  </h4>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {project.author_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {project.course}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <Download className="h-3 w-3" />
                    {project.downloads || 0} downloads
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Eye className="h-3 w-3" />
                    {project.views || 0} views
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Batch {project.batch}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewProject && onViewProject(project)}
                  className="text-xs"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recentProjects.length === 10 && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            View All Projects
          </Button>
        </div>
      )}
    </Card>
  );
}
