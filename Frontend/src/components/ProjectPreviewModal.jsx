import { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  Eye,
  AlertCircle,
  File,
  Archive,
} from "lucide-react";
import { Button } from "./Button";
import { useToast } from "./Toast";
import api from "../api/api";

export default function ProjectPreviewModal({ project, open, onClose }) {
  const [previewData, setPreviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (open && project) {
      loadPreview();
    } else {
      setPreviewData(null);
      setError(null);
    }
  }, [open, project]);

  const loadPreview = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/project/preview/${project.id}`);
      setPreviewData(response.data.data);
    } catch (err) {
      console.error("Preview failed", err);
      setError(err.response?.data?.message || "Failed to load preview");
      toast.error("Failed to load file preview", {
        title: "Preview Error",
        description: "Please try again or download the file directly.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const resp = await api.get(`/project/download/${project.id}`, {
        responseType: "blob",
      });

      const disposition = resp.headers["content-disposition"] || "";
      let filename = previewData?.filename || "project";
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (extension, previewType) => {
    if (previewType === "archive") return Archive;
    if (extension === ".pdf") return FileText;
    if ([".txt", ".json"].includes(extension)) return FileText;
    return File;
  };

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                File Preview
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {project.title}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  Loading preview...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Preview Error
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {error}
                </p>
                <Button onClick={loadPreview} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          ) : previewData ? (
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    {(() => {
                      const IconComponent = getFileIcon(
                        previewData.extension,
                        previewData.previewType,
                      );
                      return <IconComponent className="w-6 h-6 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {previewData.filename}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span>Size: {formatFileSize(previewData.size)}</span>
                      <span>Type: {previewData.extension.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              {previewData.canPreviewContent ? (
                <div className="space-y-4">
                  {previewData.previewType === "text" && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        File Content
                      </h4>
                      <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto">
                        {previewData.content}
                      </pre>
                    </div>
                  )}

                  {previewData.previewType === "pdf" && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        PDF Preview
                      </h4>
                      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 text-center">
                          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            PDF Preview
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            PDF files can be viewed by downloading them to your
                            device.
                          </p>
                          <Button
                            onClick={handleDownload}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200/50 dark:border-amber-800/50 text-center">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    {(() => {
                      const IconComponent = getFileIcon(
                        previewData.extension,
                        previewData.previewType,
                      );
                      return (
                        <IconComponent className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                      );
                    })()}
                  </div>
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">
                    Preview Not Available
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300 mb-4">
                    {previewData.message}
                  </p>
                  <Button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/20 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Use preview to review project content before making approval
            decisions
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? "Downloading..." : "Download"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
