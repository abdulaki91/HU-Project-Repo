import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
// import { Button } from "flowbite-react";
import useCreateResource from "../hooks/useCreateResource";
import { toast } from "react-toastify";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Textarea } from "../components/Textarea";
import { departments } from "../constants/departments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/Select";
import { Badge } from "../components/Badge";
import { X } from "lucide-react";
import courses from "../constants/courses";

const batches = ["2024", "2023", "2022", "2021", "2020"];

export function UploadProject() {
  const formRef = useRef(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mode, setMode] = useState(""); // "create" or "draft"

  // Mutations
  const { mutate: createProject, isSuccess: createSuccess } = useCreateResource(
    "project/create",
    "projects"
  );
  const { user } = useAuth();

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFileChange = (e) => {
    if (e.target.files) setUploadedFiles(Array.from(e.target.files));
  };

  const buildFormData = () => {
    const formData = new FormData(formRef.current);
    formData.append("tags", JSON.stringify(tags));

    return formData;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = buildFormData();

    setMode("create");
    createProject(
      {
        data: formData,
        config: { headers: { "Content-Type": "multipart/form-data" } },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      },
      {
        onSuccess: () => {
          toast.success("Project uploaded successfully!");
        },
        onError: () => {
          toast.error("Upload failed!");
        },
      }
    );

    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-slate-900 dark:text-white mb-2">Upload Project</h1>

      <Card className="p-8 dark:bg-slate-800 dark:border-slate-700">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="dark:text-slate-200">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Project Title"
              required
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="dark:text-slate-200">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Project Description"
              required
              className="min-h-32 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          {/* Course, Batch, Date, Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="course" className="dark:text-slate-200">
                Course
              </Label>
              <Select
                name="course"
                required
                onValueChange={(value) =>
                  (formRef.current.course.value = value)
                }
              >
                <SelectTrigger
                  id="course"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                  {courses.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch" className="dark:text-slate-200">
                Batch/Year
              </Label>
              <Select
                name="batch"
                required
                onValueChange={(value) => (formRef.current.batch.value = value)}
              >
                <SelectTrigger
                  id="batch"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                  {batches.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="dark:text-slate-200">
                Department
              </Label>
              <Select
                name="department"
                required
                onValueChange={(value) =>
                  (formRef.current.department.value = value)
                }
              >
                <SelectTrigger
                  id="department"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_name" className="dark:text-slate-200">
                Author Name
              </Label>
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
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <input type="hidden" name="course" />
            <input type="hidden" name="batch" />
            <input type="hidden" name="department" />
          </div>
          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="dark:text-slate-200">
              Technology Tags
            </Label>
            <Input
              id="tags"
              placeholder="Type a technology and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="pl-3 pr-2 py-1 dark:bg-slate-700 dark:text-slate-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file" className="dark:text-slate-200">
              Project File
            </Label>
            <input
              type="file"
              id="file"
              name="file"
              required
              onChange={handleFileChange}
              accept=".zip,.pdf,.ppt,.pptx,.doc,.docx"
              className="block w-full text-slate-700 dark:text-slate-300"
            />
            {uploadedFiles.length > 0 && (
              <div className="mt-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm text-slate-600 dark:text-slate-400"
                  >
                    {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded h-4">
                <div
                  className="bg-blue-600 h-4 rounded"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-800 dark:text-gray-50">
                {progress}% uploaded
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Upload Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

         
          
    