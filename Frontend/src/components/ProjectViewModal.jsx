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
  Sparkles,
  Tag,
  Building,
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
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          // Close modal when clicking on backdrop
          if (e.target === e.currentTarget) {
            onClose(false);
          }
        }}
      >
        <div className="w-full max-w-4xl max-h-[90vh] flex flex-col">
          <Card className="bg-white/10 dark:bg-slate-900/10 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-2xl flex flex-col max-h-full">
            {/* Header */}
            <div className="flex-shrink-0 p-6 pb-0 bg-white/5 dark:bg-slate-900/5 backdrop-blur-xl">
              <button
                onClick={() => onClose(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 dark:hover:bg-slate-800/50 rounded-full transition-colors z-20"
              >
                <X className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </button>

              <div className="pr-12">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight drop-shadow-sm">
                      {project.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {project.author_name || project.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {project.created_at
                          ? new Date(project.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "Unknown date"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Quick Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`flex items-center gap-1 ${getStatusColor(project.status)}`}
                    >
                      {getStatusIcon(project.status)}
                      {project.status?.charAt(0).toUpperCase() +
                        project.status?.slice(1)}
                    </Badge>
                    {isAdmin && !canModify && (
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-300"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Different Department
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {project.views || 0} views
                    </div>
                    <div className="flex items-center gap-1">
                      <DownloadIcon className="h-4 w-4" />
                      {project.downloads || 0} downloads
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <div>
                    <Label className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      Project Description
                    </Label>
                    <div className="bg-white/10 dark:bg-slate-800/30 rounded-xl p-4 border border-white/20 dark:border-slate-700/50 backdrop-blur-sm">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {projectTags.length > 0 && (
                    <div>
                      <Label className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Technologies Used
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {projectTags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300/50 dark:border-blue-800 text-blue-700 dark:text-blue-300 backdrop-blur-sm"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason (if rejected) */}
                  {project.status === "rejected" && project.rejectionReason && (
                    <div>
                      <Label className="text-base font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Rejection Reason
                      </Label>
                      <div className="bg-red-500/10 dark:bg-red-900/20 rounded-xl p-4 border border-red-300/50 dark:border-red-800/50 backdrop-blur-sm">
                        <p className="text-red-700 dark:text-red-300">
                          {project.rejectionReason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Project Details */}
                  <div className="bg-white/10 dark:bg-slate-800/30 rounded-xl p-4 border border-white/20 dark:border-slate-700/50 backdrop-blur-sm">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Project Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Course:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {project.course}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Department:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {project.department}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Batch:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {project.batch}
                        </span>
                      </div>
                      {project.file_size && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">
                            File Size:
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {formatBytes(project.file_size)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && canModify && project.status === "pending" && (
                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-300/50 dark:border-indigo-800 backdrop-blur-sm">
                      <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Admin Actions
                      </h3>

                      {!showRejectionForm ? (
                        <div className="space-y-3">
                          <Button
                            onClick={handleApprove}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isLoading ? "Approving..." : "Approve Project"}
                          </Button>
                          <Button
                            onClick={() => setShowRejectionForm(true)}
                            variant="outline"
                            className="w-full border-red-300 text-red-700 hover:bg-red-500/10 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
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
                              className="min-h-20 text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleReject}
                              disabled={isLoading}
                              size="sm"
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
                              size="sm"
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Download Section */}
                  {project.file_path && (
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-300/50 dark:border-blue-800 backdrop-blur-sm">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Project Files
                      </h3>

                      {/* File Information */}
                      <div className="mb-3 p-3 bg-white/10 dark:bg-slate-800/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">
                            {project.file_path
                              ? project.file_path.split(/[\\/]/).pop()
                              : "Project File"}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={handleDownload}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isLoading
                          ? "Downloading..."
                          : canModify && project.status === "pending"
                            ? "Download & Review"
                            : "Download Project"}
                      </Button>

                      {/* Preview Button for Admins */}
                      {canModify && project.status === "pending" && (
                        <Button
                          onClick={() => setShowPreview(true)}
                          variant="outline"
                          className="w-full mt-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Quick Preview
                        </Button>
                      )}

                      {/* Additional info for admins */}
                      {canModify && project.status === "pending" && (
                        <div className="mt-3 p-2 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <strong>Admin Review:</strong> Download the project
                            files to verify content before approval
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Project Rating Section - Only for approved projects */}
                  {project.status === "approved" && (
                    <div>
                      <ProjectRating project={project} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 bg-white/5 dark:bg-slate-800/30 border-t border-white/20 dark:border-slate-700/50 rounded-b-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700 dark:text-slate-300">
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
          </Card>
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
