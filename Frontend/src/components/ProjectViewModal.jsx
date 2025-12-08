import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Label } from "./Label";
import { Textarea } from "./Textarea";
import { Download } from "lucide-react";
import { formatBytes } from "../utils/utils";
import api from "../api/api";
import { useQueryClient } from "@tanstack/react-query";

export default function ProjectViewModal({
  project,
  open,
  onClose,
  currentUser,
}) {
  const queryClient = useQueryClient();
  if (!open || !project) return null;

  const handleDownload = async () => {
    try {
      const resp = await api.get(`/project/download/${project.id}`, {
        responseType: "blob",
      });
      const disposition = resp.headers["content-disposition"] || "";
      let filename = project.file_path
        ? project.file_path.split(/[\\/]/).pop()
        : "project";
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) filename = match[1];
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  // Admin flag (any admin)
  const isAdmin = currentUser && currentUser.role === "admin";
  // Admin can modify only if their department matches the project's course
  const canModify = isAdmin && currentUser.department === project.course;

  const [selectedStatus, setSelectedStatus] = useState(
    project.status || "pending"
  );

  useEffect(() => {
    setSelectedStatus(project.status || "pending");
  }, [project]);

  const changeStatus = async (status) => {
    try {
      await api.put(`/project/status/${project.id}`, { status });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      onClose(true);
    } catch (err) {
      console.error("Status update failed", err);
      onClose(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-2xl p-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              By {project.author || project.author_name}
            </div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {project.created_at
              ? new Date(project.created_at).toLocaleDateString()
              : ""}
          </div>
        </div>

        <div className="mt-4">
          <Label>Description</Label>
          <Textarea
            value={project.description || ""}
            readOnly
            className="min-h-[120px]"
          />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Badge variant="outline">{project.course}</Badge>
          <span>•</span>
          <span>Batch {project.batch}</span>
          {project.file_size ? (
            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
              {formatBytes(project.file_size)}
            </span>
          ) : null}
        </div>

        <div className="flex gap-2 mt-6 justify-end">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm dark:bg-input/30 dark:border-input"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
              <Button
                variant="default"
                onClick={() => changeStatus(selectedStatus)}
                size="sm"
                disabled={!canModify}
              >
                Save
              </Button>
              {!canModify && (
                <div className="text-sm text-amber-600 dark:text-amber-400">
                  You can only modify projects in your department
                </div>
              )}
            </div>
          )}

          {project.file_path && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          )}

          <Button variant="ghost" onClick={() => onClose(false)}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
