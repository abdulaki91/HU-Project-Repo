import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Label } from "./Label";
import { Textarea } from "./Textarea";
import { useToast } from "./Toast";
import {
  Download,
  X,
  Calendar,
  User,
  BookOpen,
  FileText,
  Eye,
  Download as DownloadIcon,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Tag,
  Star,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { formatBytes } from "../utils/utils";
import api from "../api/api";
import { useQueryClient } from "@tanstack/react-query";
import ProjectPreviewModal from "./ProjectPreviewModal";
import ProjectRating from "./ProjectRating";

export default function ProjectViewModal({
  project,
  open,
  onClose,
  currentUser,
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open || !project) return null;

  const handleDownload = async () => {
    try {
      setIsLoading(true);
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

      toast.success("Download started successfully!", {
        title: "File Downloaded",
        description: `${filename} has been downloaded to your device.`,
      });

      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Failed to download file", {
        title: "Download Error",
        description:
          "Please try again or contact support if the issue persists.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Admin permissions
  const isAdmin =
    currentUser &&
    (currentUser.role === "admin" || currentUser.role === "super-admin");
  const canModify = isAdmin && currentUser.department === project.department;

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      await api.put(`/project/admin/approve/${project.id}`, {
        status: "approved",
      });

      toast.success("Project approved successfully!", {
        title: "Project Approved",
        description: `"${project.title}" is now visible to all users.`,
      });

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose(true);
    } catch (err) {
      console.error("Approval failed", err);
      toast.error("Failed to approve project", {
        title: "Approval Error",
        description: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      await api.put(`/project/admin/reject/${project.id}`, {
        status: "rejected",
        reason: rejectionReason.trim() || "No reason provided",
      });

      toast.success("Project rejected", {
        title: "Project Rejected",
        description: `"${project.title}" has been rejected and the author will be notified.`,
      });

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose(true);
    } catch (err) {
      console.error("Rejection failed", err);
      toast.error("Failed to reject project", {
        title: "Rejection Error",
        description: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200";
    }
  };

  // Parse tags if they exist
  let projectTags = [];
  try {
    if (project.tags && typeof project.tags === "string") {
      projectTags = JSON.parse(project.tags);
    } else if (Array.isArray(project.tags)) {
      projectTags = project.tags;
    }
  } catch (e) {
    projectTags = [];
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose(false);
          }
        }}
      >
        {/* Modal Container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-full max-h-[95vh] flex flex-col bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 dark:border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden">
            {/* Fixed Header */}
            <div className="flex-shrink-0 relative">
              {/* Close Button */}
              <button
                onClick={() => onClose(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-slate-800/50 hover:bg-slate-700/70 dark:bg-slate-700/50 dark:hover:bg-slate-600/70 rounded-full transition-all duration-200 backdrop-blur-sm border border-slate-600/30"
              >
                <X className="h-5 w-5 text-slate-200 dark:text-slate-300" />
              </button>

              {/* Header Content */}
              <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/15 dark:from-indigo-900/30 dark:via-purple-900/20 dark:to-pink-900/25 p-6 border-b border-slate-600/30 dark:border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-start gap-4 pr-12">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-slate-100 dark:text-white mb-2 leading-tight">
                      {project.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-slate-300 dark:text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{project.author_name || project.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {project.created_at
                            ? new Date(project.created_at).toLocaleDateString()
                            : "Unknown date"}
                        </span>
                      </div>
                    </div>

                    {/* Status and Stats */}
                    <div className="flex items-center gap-4">
                      <Badge
                        className={`flex items-center gap-1 ${getStatusColor(project.status)}`}
                      >
                        {getStatusIcon(project.status)}
                        {project.status?.charAt(0).toUpperCase() +
                          project.status?.slice(1)}
                      </Badge>
                      <div className="flex items-center gap-4 text-sm text-slate-400 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {project.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <DownloadIcon className="h-4 w-4" />
                          {project.downloads || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                {/* Project Description */}
                <section>
                  <h2 className="text-lg font-semibold text-slate-100 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-400 dark:text-indigo-400" />
                    Description
                  </h2>
                  <div className="bg-slate-800/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-600/30 dark:border-slate-700 backdrop-blur-sm">
                    <p className="text-slate-200 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                </section>

                {/* Project Details Grid */}
                <section>
                  <h2 className="text-lg font-semibold text-slate-100 dark:text-white mb-4">
                    Project Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-600/30 dark:border-slate-700">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 dark:text-slate-400 text-sm">
                            Course
                          </span>
                          <span className="font-medium text-slate-100 dark:text-white">
                            {project.course}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 dark:text-slate-400 text-sm">
                            Department
                          </span>
                          <span className="font-medium text-slate-100 dark:text-white">
                            {project.department}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 dark:text-slate-400 text-sm">
                            Batch
                          </span>
                          <span className="font-medium text-slate-100 dark:text-white">
                            {project.batch}
                          </span>
                        </div>
                      </div>
                    </div>

                    {project.file_size && (
                      <div className="bg-slate-800/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-600/30 dark:border-slate-700">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300 dark:text-slate-400 text-sm">
                              File Size
                            </span>
                            <span className="font-medium text-slate-100 dark:text-white">
                              {formatBytes(project.file_size)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300 dark:text-slate-400 text-sm">
                              File Name
                            </span>
                            <span className="font-medium text-slate-100 dark:text-white text-sm truncate">
                              {project.file_path
                                ? project.file_path.split(/[\\/]/).pop()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Technologies Used */}
                {projectTags.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Technologies Used
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {projectTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}

                {/* Rejection Reason */}
                {project.status === "rejected" && project.rejectionReason && (
                  <section>
                    <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Rejection Reason
                    </h2>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                      <p className="text-red-700 dark:text-red-300">
                        {project.rejectionReason}
                      </p>
                    </div>
                  </section>
                )}

                {/* Admin Actions */}
                {isAdmin && canModify && project.status === "pending" && (
                  <section>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Admin Actions
                    </h2>
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
                      {!showRejectionForm ? (
                        <div className="flex gap-3">
                          <Button
                            onClick={handleApprove}
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isLoading ? "Approving..." : "Approve Project"}
                          </Button>
                          <Button
                            onClick={() => setShowRejectionForm(true)}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Project
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                              Rejection Reason
                            </Label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) =>
                                setRejectionReason(e.target.value)
                              }
                              placeholder="Please provide a reason for rejection..."
                              className="min-h-20"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleReject}
                              disabled={isLoading}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                              {isLoading ? "Rejecting..." : "Confirm Reject"}
                            </Button>
                            <Button
                              onClick={() => {
                                setShowRejectionForm(false);
                                setRejectionReason("");
                              }}
                              variant="outline"
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Download Section */}
                {project.file_path && (
                  <section>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      Project Files
                    </h2>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-900 dark:text-blue-200">
                          {project.file_path
                            ? project.file_path.split(/[\\/]/).pop()
                            : "Project File"}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleDownload}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {isLoading ? "Downloading..." : "Download Project"}
                        </Button>

                        {canModify && project.status === "pending" && (
                          <Button
                            onClick={() => setShowPreview(true)}
                            variant="outline"
                            className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Rating Section - Only for approved projects */}
                {project.status === "approved" && (
                  <section>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Ratings & Reviews
                    </h2>
                    <ProjectRating project={project} />
                  </section>
                )}
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex-shrink-0 bg-slate-800/50 dark:bg-slate-800/50 border-t border-slate-600/30 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {isAdmin && canModify
                    ? "You have permission to manage this project"
                    : isAdmin && !canModify
                      ? "This project is from a different department"
                      : "Project details and files"}
                </div>
                <Button
                  onClick={() => onClose(false)}
                  variant="ghost"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Preview Modal */}
      <ProjectPreviewModal
        project={project}
        open={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}
