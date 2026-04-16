import { useState, useEffect } from "react";
import useFetchResource from "../hooks/useFetchResource";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { useToast } from "../components/Toast";
import {
  Download,
  FolderOpen,
  Calendar,
  FileText,
  Edit3,
  Eye,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import api from "../api/api";
import { useQueryClient } from "@tanstack/react-query";
import EditProjectModal from "../components/EditProjectModal";

export function MyProjects() {
  const { data: userProjects = [], isLoading } = useFetchResource(
    "project/my-projects",
    "my-projects",
  );
  const toast = useToast();
  const queryClient = useQueryClient();
  const [editingProject, setEditingProject] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
      toast.info("Preparing your download...", {
        title: "Download Starting",
        duration: 2000,
      });
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

      toast.success("Download completed successfully!", {
        title: "Download Complete",
        description: "The file has been saved to your downloads folder.",
        duration: 4000,
      });
      queryClient.invalidateQueries(["my-projects"]);
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Download failed. Please try again.", {
        title: "Download Error",
        description: "There was a problem downloading the file.",
        duration: 5000,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-400 dark:border-green-800";
      case "rejected":
        return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200 dark:from-red-900/20 dark:to-rose-900/20 dark:text-red-400 dark:border-red-800";
      case "pending":
        return "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:text-amber-400 dark:border-amber-800";
      default:
        return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200 dark:from-slate-900/20 dark:to-gray-900/20 dark:text-slate-400 dark:border-slate-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`space-y-8 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
          <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Your Project Portfolio
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
          My Projects
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Manage and track your uploaded projects
        </p>
      </div>

      {/* Stats Cards */}
      {userProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 glass-morphism border-0 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userProjects.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total Projects
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-morphism border-0 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userProjects.reduce((sum, p) => sum + (p.downloads || 0), 0)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total Downloads
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-morphism border-0 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userProjects.filter((p) => p.status === "approved").length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Approved
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Projects List */}
      {userProjects.length === 0 ? (
        <Card className="p-12 text-center glass-morphism border-0 backdrop-blur-xl shadow-lg">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              No projects yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Start building your portfolio by uploading your first project
            </p>
            <Button
              onClick={() => (window.location.href = "/upload")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Upload Your First Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {userProjects.map((project, index) => (
            <Card
              key={project.id}
              className={`p-8 glass-morphism border-0 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] ${
                index % 2 === 0
                  ? "animate-slide-in-left"
                  : "animate-slide-in-right"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-6">
                {/* Project Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {project.title}
                      </h3>
                      <Badge
                        className={`px-3 py-1 rounded-full border ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </Badge>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-medium">{project.course}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {project.created_at
                            ? new Date(project.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : ""}
                        </span>
                      </div>

                      {project.file_size && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                          <span>{formatBytes(project.file_size)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Stats */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center">
                        <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-medium">
                        {project.downloads || 0} downloads
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Eye className="w-4 h-4" />
                      <span>Batch {project.batch}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProject(project);
                        setEditOpen(true);
                      }}
                      className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>

                    <Button
                      onClick={() => handleDownload(project)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EditProjectModal
        project={editingProject}
        open={editOpen}
        onClose={(saved) => {
          setEditOpen(false);
          setEditingProject(null);
          if (saved) {
            queryClient.invalidateQueries({ queryKey: ["my-projects"] });
            toast.success("Project updated successfully!", {
              title: "Changes Saved",
              description: "Your project information has been updated.",
              duration: 4000,
            });
          }
        }}
      />
    </div>
  );
}
