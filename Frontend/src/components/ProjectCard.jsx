import React from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Download, User, Calendar } from "lucide-react";
import { formatBytes } from "../utils/utils";

export default function ProjectCard({
  project,
  currentUser,
  currentUserId,
  onDownload,
  onEdit,
  onApprove,
  onReject,
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
      className="p-6 hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-slate-900 dark:text-white mb-2">
            {project.title}
          </h3>
          {variant === "grid" && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Badge
            variant="outline"
            className="dark:border-slate-600 dark:text-slate-300"
          >
            {project.course}
          </Badge>
          <span>•</span>
          <span>Batch {project.batch}</span>
          {project.status ? (
            <span className="ml-2">
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
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {(project.tags || []).map((tag, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="dark:bg-slate-700 dark:text-slate-300"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {project.downloads}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthor && (
              <Button size="sm" onClick={() => onEdit && onEdit(project)}>
                Edit
              </Button>
            )}

            {isAdmin && project.status === "pending" ? (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onApprove && onApprove(project)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject && onReject(project)}
                >
                  Reject
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => onDownload && onDownload(project)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <User className="h-3 w-3" />
          <span>{project.author}</span>
          <span>•</span>
          <Calendar className="h-3 w-3" />
          <span>
            {project.created_at
              ? new Date(project.created_at).toLocaleDateString()
              : ""}
          </span>
          {project.file_size ? (
            <>
              <span>•</span>
              <span>{formatBytes(project.file_size)}</span>
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
