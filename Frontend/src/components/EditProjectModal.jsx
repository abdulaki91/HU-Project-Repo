import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
import { Textarea } from "./Textarea";
import { useToast } from "./Toast";
import useEditResource from "../hooks/useEditResource";
import { Upload, File, X, AlertCircle } from "lucide-react";

export default function EditProjectModal({
  project,
  open,
  onClose,
  invalidateKey = ["projects"],
}) {
  const [form, setForm] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const editMutation = useEditResource("project/edit", invalidateKey);
  const toast = useToast();

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || "",
        description: project.description || "",
        course: project.course || "",
        batch: project.batch || "",
        tags:
          (project.tags && Array.isArray(project.tags)
            ? project.tags.join(", ")
            : typeof project.tags === "string"
              ? project.tags
              : "") || "",
      });
    } else {
      setForm({});
    }
    // Reset file selection when project changes
    setSelectedFile(null);
    setFileError("");
  }, [project]);

  if (!open) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((p) => ({ ...p, [id]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/zip",
      "application/x-zip-compressed",
      "application/x-zip",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "application/json",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError(
        "Invalid file type. Only ZIP, PDF, PPT, PPTX, DOC, DOCX, TXT, and JSON files are allowed.",
      );
      setSelectedFile(null);
      return;
    }

    // Validate file size (3GB limit)
    const maxSize = 3 * 1024 * 1024 * 1024; // 3GB
    if (file.size > maxSize) {
      setFileError("File size too large. Maximum size is 3GB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError("");
    // Reset the file input
    const fileInput = document.getElementById("project-file");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project) return;

    try {
      // Create FormData for file upload if file is selected
      let payload;

      if (selectedFile) {
        // If file is selected, use FormData for multipart upload
        payload = new FormData();
        payload.append("id", project.id);
        payload.append("title", form.title);
        payload.append("description", form.description);
        payload.append("course", form.course);
        payload.append("batch", form.batch);
        payload.append(
          "tags",
          JSON.stringify(
            form.tags
              ? form.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
          ),
        );
        payload.append("file", selectedFile);

        toast.loading("Updating project with new file...", {
          title: "Uploading",
          description: "Please wait while we update your project.",
        });
      } else {
        // If no file, use regular JSON payload
        payload = {
          id: project.id,
          title: form.title,
          description: form.description,
          course: form.course,
          batch: form.batch,
          tags: form.tags
            ? form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
        };

        toast.loading("Updating project...", {
          title: "Saving",
          description: "Please wait while we save your changes.",
        });
      }

      await editMutation.mutateAsync(payload);

      toast.success("Project updated successfully!", {
        title: "Update Complete",
        description: selectedFile
          ? "Your project and file have been updated."
          : "Your project details have been updated.",
      });

      onClose(true);
    } catch (err) {
      console.error("Failed to update project", err);

      toast.error("Failed to update project", {
        title: "Update Error",
        description:
          err.response?.data?.message || "Please try again or contact support.",
      });

      onClose(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-2xl p-6 dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                value={form.course || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="batch">Batch</Label>
              <Input
                id="batch"
                value={form.batch || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={form.tags || ""} onChange={handleChange} />
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <Label htmlFor="project-file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Update Project File (Optional)
            </Label>

            {/* Current File Info */}
            {project?.file_path && !selectedFile && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <File className="h-4 w-4" />
                  <span>
                    Current file: {project.file_path.split(/[\\/]/).pop()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Upload a new file to replace the current one
                </p>
              </div>
            )}

            {/* File Input */}
            <div className="relative">
              <input
                id="project-file"
                type="file"
                onChange={handleFileChange}
                accept=".zip,.pdf,.doc,.docx,.ppt,.pptx,.txt,.json"
                className="hidden"
              />
              <label
                htmlFor="project-file"
                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Click to select a new file
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    ZIP, PDF, PPT, PPTX, DOC, DOCX, TXT, JSON (Max 3GB)
                  </p>
                </div>
              </label>
            </div>

            {/* Selected File Display */}
            {selectedFile && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* File Error Display */}
            {fileError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {fileError}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
