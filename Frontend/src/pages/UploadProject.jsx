import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Textarea } from "../components/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/Select";
import { Badge } from "../components/Badge";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";

export function UploadProject() {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const courses = [
    "Artificial Intelligence",
    "Web Development",
    "Mobile App Development",
    "Data Science",
    "Cloud Computing",
    "Cybersecurity",
    "Software Engineering",
    "Database Management",
    "Computer Networks",
    "Machine Learning",
  ];

  const batches = ["2024", "2023", "2022", "2021", "2020"];

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="p-12 text-center max-w-md dark:bg-slate-800 dark:border-slate-700">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-slate-900 dark:text-white mb-2">
            Project Uploaded Successfully!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your project has been submitted and is now available in the
            repository.
          </p>
          <Button onClick={() => setIsSubmitted(false)}>
            Upload Another Project
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Upload Project</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Share your project with the campus community and contribute to the
          knowledge repository
        </p>
      </div>

      <Card className="p-8 dark:bg-slate-800 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="dark:text-slate-200">
              Project Title
            </Label>
            <Input
              id="title"
              placeholder="Enter your project title"
              required
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="dark:text-slate-200">
              Project Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your project, its objectives, and key features"
              className="min-h-32 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              required
            />
          </div>

          {/* Course & Batch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course */}
            <div className="space-y-2">
              <Label htmlFor="course" className="dark:text-slate-200">
                Course
              </Label>
              <Select required>
                <SelectTrigger
                  id="course"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                  {courses.map((course) => (
                    <SelectItem
                      key={course}
                      value={course}
                      className="dark:text-white"
                    >
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Batch */}
            <div className="space-y-2">
              <Label htmlFor="batch" className="dark:text-slate-200">
                Batch/Year
              </Label>
              <Select required>
                <SelectTrigger
                  id="batch"
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                  {batches.map((batch) => (
                    <SelectItem
                      key={batch}
                      value={batch}
                      className="dark:text-white"
                    >
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
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
            <Label htmlFor="files" className="dark:text-slate-200">
              Project Files
            </Label>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors">
              <input
                type="file"
                id="files"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              <label htmlFor="files" className="cursor-pointer">
                <Upload className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <p className="text-slate-700 dark:text-slate-300 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  PDF, DOC, ZIP
                </p>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Uploaded files:
                </p>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border border-slate-200 dark:border-slate-700 rounded"
                  >
                    <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                      {file.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              Upload Project
            </Button>
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
