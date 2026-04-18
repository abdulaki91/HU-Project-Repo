import React from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import {
  Download,
  User,
  Calendar,
  Star,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
} from "lucide-react";
import { formatBytes } from "../utils/utils";
import { formatTagsForDisplay } from "../utils/tagUtils";
import useFetchResource from "../hooks/useFetchResource";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

// Utility function to safely render values that might be objects
const safeRender = (value) => {
  if (typeof value === "object" && value !== null) {
    // Handle author objects with firstName, lastName, email
    if (value.firstName || value.lastName) {
      return `${value.firstName || ""} ${value.lastName || ""}`.trim();
    }
    // Handle other objects with value/label structure
    return value.label || value.value || JSON.stringify(value);
  }
  return value || "";
};

export default function ProjectCard({
  project,
  currentUser,
  currentUserId,
  onDownload,
  onEdit,
  onView,
  onStatusChange,
  variant = "grid",
}) {
  const isAuthor = currentUserId && currentUserId === project.author_id;
  const isAdmin =
    currentUser &&
    currentUser.role === "admin" &&
    currentUser.department === project.course;

  // Fetch rating data for approved projects
  const { data: ratingsData } = useFetchResource(
    project.status === "approved" ? `rating/project/${project.id}` : null,
    ["project-ratings", project.id],
    project.status === "approved",
  );

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Content */}
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
              {safeRender(project.title)}
            </h3>
            {variant === "grid" && (
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {safeRender(project.description)}
              </p>
            )}
          </div>
        </div>

        {/* Project Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium"
            >
              {safeRender(project.course)}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4" />
              <span>Batch {safeRender(project.batch)}</span>
            </div>
          </div>

          {/* Status Badge */}
          {project.status && (
            <div className="flex items-center gap-2">
              {project.status === "approved" && (
                <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              )}
              {project.status === "rejected" && (
                <Badge className="bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Rejected
                </Badge>
              )}
              {project.status === "pending" && (
                <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Technologies */}
        {(() => {
          const { displayTags, hasMore, remainingCount } = formatTagsForDisplay(
            project.tags,
            4,
          );

          return displayTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {displayTags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 text-xs hover:scale-105 transition-transform duration-200"
                >
                  {typeof tag === "object"
                    ? tag.label || tag.value || tag
                    : tag}
                </Badge>
              ))}
              {hasMore && (
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 text-xs"
                >
                  +{remainingCount} more
                </Badge>
              )}
            </div>
          ) : null;
        })()}

        {/* Department Info */}
        <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-200/50 dark:border-slate-700/50">
          <span className="font-medium">Department:</span> {project.department}
        </div>

        {/* Stats and Actions */}
        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          {/* Stats Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-1 rounded-full">
                <Download className="h-3 w-3" />
                <span className="font-medium">{project.downloads || 0}</span>
              </div>
              {project.status === "approved" &&
                ratingsData?.stats &&
                ratingsData.stats.totalRatings > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-100/50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-yellow-700 dark:text-yellow-400">
                      {ratingsData.stats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">
                      ({ratingsData.stats.totalRatings})
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {(isAuthor || (isAdmin && project.status !== "pending")) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(project)}
                className="border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors duration-200"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}

            {isAdmin && project.status === "pending" ? (
              <Select
                value={project.status}
                onValueChange={(value) => onStatusChange(project.id, value)}
              >
                <SelectTrigger className="flex-1 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Approved
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Rejected
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2 flex-1">
                {project.status === "approved" && onView && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onView(project)}
                    className="flex-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    View & Rate
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => onDownload(project)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Author and Date */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/30 dark:border-slate-700/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium">
              {safeRender(project.author_name || project.author)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {project.created_at
                ? new Date(project.created_at).toLocaleDateString()
                : ""}
            </span>
          </div>
          {project.file_size && (
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{formatBytes(project.file_size)}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
