import React from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Download, User, Calendar } from "lucide-react";
import { formatBytes } from "../utils/utils";
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
  onStatusChange,
  variant = "grid",
}) {
  const isAuthor = currentUserId && currentUserId === project.author_id;
  const isAdmin =
    currentUser &&
    currentUser.role === "admin" &&
    currentUser.department === project.course;

  return (
    <Card
      key={project.id}
      className="p-6 border transition-all hover:shadow-lg
                 bg-white hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-700
                 border-slate-200 dark:border-slate-700"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-slate-900 dark:text-white mb-2">
            {safeRender(project.title)}
          </h3>
          {variant === "grid" && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {safeRender(project.description)}
            </p>
          )}
        </div>

        <div className="flex gap-2 text-sm text-slate-500 dark:text-slate-400 flex-col">
          <Badge
            variant="outline"
            className="dark:border-slate-600 dark:text-slate-300"
          >
            {safeRender(project.course)}
          </Badge>
          <p className="space-x-2">
            <span>•</span>
            <span>Batch {safeRender(project.batch)}</span>
          </p>
          {project.status && (
            <span className="ml-2">
              Status:{" "}
              {project.status === "approved" && (
                <Badge variant="default">Approved</Badge>
              )}
              {project.status === "rejected" && (
                <Badge variant="destructive">Rejected</Badge>
              )}
              {project.status === "pending" && (
                <Badge variant="outline">Pending</Badge>
              )}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {(project.tags || []).map((tag, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="dark:bg-slate-700 dark:text-slate-300"
            >
              {typeof tag === "object" ? tag.label || tag.value || tag : tag}
            </Badge>
          ))}
          <div className="text-slate-500 dark:text-slate-200 text-sm">
            Department: {project.department}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {project.downloads}
            </div>
            <div>Uploaded by: {project.author_name}</div>
          </div>

          <div className="flex items-center gap-2">
            {(isAuthor || (isAdmin && project.status !== "pending")) && (
              <Button size="sm" onClick={() => onEdit(project)}>
                Edit
              </Button>
            )}

            {isAdmin && project.status === "pending" ? (
              <Select
                value={project.status}
                onValueChange={(value) => onStatusChange(project.id, value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Button size="sm" onClick={() => onDownload(project)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <User className="h-3 w-3" />
          <span>{safeRender(project.author_name || project.author)}</span>
          <span>•</span>
          <Calendar className="h-3 w-3" />
          <span>
            {project.created_at
              ? new Date(project.created_at).toLocaleDateString()
              : ""}
          </span>
          {project.file_size && (
            <>
              <span>•</span>
              <span>{formatBytes(project.file_size)}</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
