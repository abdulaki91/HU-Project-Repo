import { useState } from "react";
import useFetchResource from "../hooks/useFetchResource";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Download } from "lucide-react";
import api from "../api/api";
import { useQueryClient } from "@tanstack/react-query";
import EditProjectModal from "../components/EditProjectModal";

export function MyProjects() {
  const { data: userProjects = [], isLoading } = useFetchResource(
    "project/my",
    "my-projects",
  );

  const queryClient = useQueryClient();
  const [editingProject, setEditingProject] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const formatBytes = (bytes) => {
    if (bytes === null || bytes === undefined) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = async (project) => {
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

      queryClient.invalidateQueries(["my-projects"]);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading && <Card className="p-6">Loading...</Card>}
      {!isLoading &&
        userProjects.map((project) => (
          <Card
            key={project.id}
            className="p-6 hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-slate-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Badge
                    variant="outline"
                    className="dark:border-slate-600 dark:text-slate-300"
                  >
                    {project.course}
                  </Badge>
                  <span>•</span>
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
              <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                {project.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />{" "}
                  <span>{project.downloads} downloads</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  onClick={() => {
                    setEditingProject(project);
                    setEditOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="dark:hover:bg-slate-700"
                  onClick={() => handleDownload(project)}
                >
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}

      <EditProjectModal
        project={editingProject}
        open={editOpen}
        onClose={(saved) => {
          setEditOpen(false);
          setEditingProject(null);
          if (saved)
            queryClient.invalidateQueries({ queryKey: ["my-projects"] });
        }}
      />
    </div>
  );
}
