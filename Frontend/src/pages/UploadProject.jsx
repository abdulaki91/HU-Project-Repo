import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Textarea } from "../components/Textarea";
import { Badge } from "../components/Badge";
import { useToast } from "../components/Toast";
import useCreateResource from "../hooks/useCreateResource";
import { departments } from "../constants/departments";
import { batches } from "../constants/batches";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/Select";
import {
  X,
  Upload,
  FileText,
  Tag,
  User,
  BookOpen,
  Sparkles,
  CheckCircle,
  Cloud,
  Plus,
} from "lucide-react";
import courses from "../constants/courses";

export function UploadProject() {
  const { user } = useAuth(); // Move this to the top
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    course: "",
    batch: "",
    department: "", // Initialize empty, will be set in useEffect
  });
  const toast = useToast();

  // Mutations
  const { mutate: createProject, isPending } = useCreateResource(
    "project/upload",
    "projects",
  );

  // Auto-set department when user data loads
  useEffect(() => {
    if (user?.department) {
      setFormData((prev) => ({ ...prev, department: user.department }));
    }
  }, [user]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();

      const trimmedTag = tagInput.trim();

      // Validate tag length
      if (trimmedTag.length > 30) {
        toast.warning("Tag is too long", {
          title: "Tag Length Error",
          description: "Each tag must be 30 characters or less",
          duration: 3000,
        });
        return;
      }

      // Check if we already have 10 tags
      if (tags.length >= 10) {
        toast.warning("Maximum tags reached", {
          title: "Tag Limit",
          description: "You can only add up to 10 tags",
          duration: 3000,
        });
        return;
      }

      if (!tags.includes(trimmedTag)) {
        setTags([...tags, trimmedTag]);
        toast.success(`Tag added: ${trimmedTag}`, {
          title: "Tag Added",
          duration: 2000,
        });
      } else {
        toast.warning("This tag already exists!", {
          title: "Duplicate Tag",
          duration: 3000,
        });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    toast.info(`Tag removed: ${tagToRemove}`, {
      title: "Tag Removed",
      duration: 2000,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`, {
        title: "File Ready",
        description: `Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: 3000,
      });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      toast.success(`File dropped: ${file.name}`, {
        title: "File Ready",
        description: `Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file to upload", {
        title: "No File Selected",
        description: "Choose a file using the file picker or drag & drop.",
        duration: 4000,
      });
      return;
    }

    // Get form data for validation
    const formElements = e.target.elements;
    const title = formElements.title.value.trim();
    const description = formElements.description.value.trim();

    // Client-side validation to prevent common errors
    const validationErrors = [];

    if (title.length < 5) {
      validationErrors.push("Title must be at least 5 characters long");
    }
    if (title.length > 200) {
      validationErrors.push("Title cannot exceed 200 characters");
    }
    if (description.length < 20) {
      validationErrors.push("Description must be at least 20 characters long");
    }
    if (description.length > 2000) {
      validationErrors.push("Description cannot exceed 2000 characters");
    }
    if (!formData.course) {
      validationErrors.push("Please select a course");
    }
    if (!formData.batch) {
      validationErrors.push("Please select a batch year");
    }
    if (!formData.department && !user?.department) {
      validationErrors.push(
        "Department information is missing from your profile",
      );
    }
    if (tags.length > 10) {
      validationErrors.push("Cannot have more than 10 tags");
    }

    // Check individual tag lengths
    const invalidTags = tags.filter((tag) => tag.length > 30);
    if (invalidTags.length > 0) {
      validationErrors.push(
        `Tags cannot exceed 30 characters: ${invalidTags.join(", ")}`,
      );
    }

    if (validationErrors.length > 0) {
      toast.error("Please fix the following issues:", {
        title: "Validation Error",
        description: validationErrors.join("\n"),
        duration: 6000,
      });
      return;
    }

    // Create FormData manually to avoid duplicates
    const submitFormData = new FormData();

    // Get form data manually
    submitFormData.append("title", title);
    submitFormData.append("description", description);
    submitFormData.append("course", formData.course);
    submitFormData.append("batch", formData.batch);
    submitFormData.append(
      "department",
      user?.department || formData.department,
    );
    submitFormData.append("author_name", formElements.author_name.value);
    submitFormData.append("tags", JSON.stringify(tags));
    submitFormData.append("file", selectedFile);

    createProject(
      {
        data: submitFormData,
        config: {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 600000, // 10 minutes for large files
        },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      },
      {
        onSuccess: () => {
          toast.success("Your project has been uploaded successfully!", {
            title: "Upload Complete",
            description:
              "Your project is now pending review by administrators.",
            duration: 5000,
          });
          // Reset form
          formRef.current?.reset();
          setTags([]);
          setSelectedFile(null);
          setProgress(0);
          setFormData({
            course: "",
            batch: "",
            department: user?.department || "",
          });
        },
        onError: (error) => {
          console.error("Upload error:", error);
          setProgress(0); // Reset progress on error

          // Handle validation errors with specific messages
          if (
            error.response?.data?.code === "VALIDATION_ERROR" &&
            error.response?.data?.errors
          ) {
            const validationErrors = error.response.data.errors;
            console.log("Validation errors received:", validationErrors);

            // Enhanced logging for debugging
            validationErrors.forEach((err, index) => {
              console.log(`Validation Error ${index + 1}:`, {
                field: err.field,
                message: err.message,
                value: err.value,
              });
            });

            if (validationErrors.length === 1) {
              toast.error(validationErrors[0].message, {
                title: "Validation Error",
                description: `Field: ${validationErrors[0].field || "Unknown"}`,
                duration: 5000,
              });
            } else if (validationErrors.length <= 3) {
              // Show detailed errors for small number of issues
              const errorList = validationErrors
                .map(
                  (err, index) =>
                    `${index + 1}. ${err.field || "Field"}: ${err.message}`,
                )
                .join("\n");

              toast.error("Please fix the following issues:", {
                title: "Multiple Validation Errors",
                description: errorList,
                duration: 8000,
              });
            } else {
              const fieldNames = validationErrors
                .slice(0, 2)
                .map((err) => err.field || "Unknown field")
                .join(", ");

              toast.error(
                `${validationErrors.length} validation errors found.`,
                {
                  title: "Form Validation Failed",
                  description: `Issues with: ${fieldNames} and ${validationErrors.length - 2} others.`,
                  duration: 7000,
                },
              );
            }

            // Log all errors for debugging
            console.log("All validation errors:", validationErrors);
          } else if (
            error.response?.data?.code === "NO_FILE" ||
            error.response?.data?.code === "INVALID_FILE_TYPE" ||
            error.response?.data?.code === "FILE_TOO_LARGE"
          ) {
            // Handle file-specific errors
            toast.error(error.response.data.message, {
              title: "File Error",
              description: "Please check your file and try again.",
              duration: 5000,
            });
          } else if (error.response?.data?.code === "INVALID_JSON") {
            // Handle JSON parsing errors
            toast.error(
              "Invalid form data. Please check your input and try again.",
              {
                title: "Form Data Error",
                description: "There was an issue processing your form data.",
                duration: 5000,
              },
            );
          } else {
            // Handle other types of errors
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Upload failed. Please try again.";

            toast.error(errorMessage, {
              title: "Upload Failed",
              description: "Please check your connection and try again.",
              duration: 5000,
            });
          }
        },
      },
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div
        className={`relative z-10 max-w-4xl mx-auto space-y-8 p-6 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {/* Header Section */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full border border-green-200/50 dark:border-green-800/50 mb-4">
            <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Share Your Innovation
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-green-900 to-slate-900 dark:from-white dark:via-green-200 dark:to-white bg-clip-text text-transparent mb-4">
            Upload Project
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Share your amazing project with the community and inspire others
          </p>
        </div>

        <Card className="p-8 glass-morphism border-0 backdrop-blur-xl shadow-xl">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
            {/* Project Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Project Details
                </h3>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-slate-700 dark:text-slate-200 font-medium"
                >
                  Project Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter your project title (minimum 5 characters)"
                  required
                  minLength={5}
                  maxLength={200}
                  className="glass-morphism border-0 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Must be 5-200 characters long
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-slate-700 dark:text-slate-200 font-medium"
                >
                  Project Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your project in detail - features, technologies used, what problems it solves... (minimum 20 characters)"
                  required
                  minLength={20}
                  maxLength={2000}
                  className="min-h-32 glass-morphism border-0 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Must be 20-2000 characters long. Be descriptive about your
                  project's features and purpose.
                </p>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Academic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="course"
                    className="text-slate-700 dark:text-slate-200 font-medium"
                  >
                    Course *
                  </Label>
                  <Select
                    value={formData.course}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, course: value }))
                    }
                  >
                    <SelectTrigger
                      id="course"
                      className="glass-morphism border-0 backdrop-blur-sm text-slate-900 dark:text-white"
                    >
                      <SelectValue placeholder="Select your course" />
                    </SelectTrigger>
                    <SelectContent className="glass-morphism border-0 backdrop-blur-xl">
                      {courses.map((c) => (
                        <SelectItem
                          key={c}
                          value={c}
                          className="text-slate-900 dark:text-white"
                        >
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="batch"
                    className="text-slate-700 dark:text-slate-200 font-medium"
                  >
                    Batch/Year *
                  </Label>
                  <Select
                    value={formData.batch}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, batch: value }))
                    }
                  >
                    <SelectTrigger
                      id="batch"
                      className="glass-morphism border-0 backdrop-blur-sm text-slate-900 dark:text-white"
                    >
                      <SelectValue placeholder="Select your batch year" />
                    </SelectTrigger>
                    <SelectContent className="glass-morphism border-0 backdrop-blur-xl">
                      {batches.map((b) => (
                        <SelectItem
                          key={b}
                          value={b}
                          className="text-slate-900 dark:text-white"
                        >
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select the year you started your program (4-digit year
                    format)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="department"
                    className="text-slate-700 dark:text-slate-200 font-medium"
                  >
                    Department *
                  </Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="department"
                      name="department"
                      value={user?.department || ""}
                      readOnly
                      className="pl-10 glass-morphism border-0 backdrop-blur-sm text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-800/50"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Department is automatically set from your profile
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="author_name"
                    className="text-slate-700 dark:text-slate-200 font-medium"
                  >
                    Author Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="author_name"
                      name="author_name"
                      placeholder="Author name"
                      defaultValue={
                        user && (user.firstName || user.lastName)
                          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                          : user?.name || ""
                      }
                      readOnly
                      className="pl-10 glass-morphism border-0 backdrop-blur-sm text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-800/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Technology Tags Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Technology Tags
                </h3>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="tags"
                  className="text-slate-700 dark:text-slate-200 font-medium"
                >
                  Add Technologies Used (Optional)
                </Label>
                <div className="relative">
                  <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="tags"
                    placeholder="Type a technology and press Enter (e.g., React, Python, MongoDB)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="pl-10 glass-morphism border-0 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add up to 10 tags, each up to 30 characters. Press Enter to
                  add each tag.
                </p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                    {tags.map((tag, index) => (
                      <Badge
                        key={tag}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-3 py-1 animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-red-200 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Project File
                </h3>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-green-400 bg-green-50/50 dark:bg-green-900/20"
                    : selectedFile
                      ? "border-green-300 bg-green-50/30 dark:bg-green-900/10"
                      : "border-slate-300 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-600"
                } glass-morphism backdrop-blur-sm`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  required
                  onChange={handleFileChange}
                  accept=".zip,.pdf,.ppt,.pptx,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {selectedFile ? (
                  <div className="space-y-3">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2"
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Supports: ZIP, PDF, PPT, PPTX, DOC, DOCX (Max 3GB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isPending || !selectedFile}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upload Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
