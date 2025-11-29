import { useRef, useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import useCreateResource from "../hooks/useCreateResource";

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
import { X, CheckCircle2 } from "lucide-react";
import axios from "axios";
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
export function UploadProject() {
  const formRef = useRef(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const batches = ["2024", "2023", "2022", "2021", "2020"];
  const { mutate, isLoading, isError, isSuccess } = useCreateResource(
    "project/create", // backend route
    "projects" // query key to invalidate
  );
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);

    // Add tags and files
    formData.append("tags", JSON.stringify(tags));

    // Log values for demonstration
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    mutate({
      data: formData,
      config: { headers: { "Content-Type": "multipart/form-data" } },
    });
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
              <Label htmlFor="date" className="dark:text-slate-200">
                Date
              </Label>
              <Input
                type="date"
                id="date"
                name="date"
                required
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_id" className="dark:text-slate-200">
                Author ID
              </Label>
              <Input
                type="text"
                id="author_id"
                name="author_id"
                placeholder="Your ID"
                required
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
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
