import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import courses from "../constants/courses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/Select";

import {
  Search,
  Download,
  Eye,
  Grid3x3,
  List,
  Calendar,
  User,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export function BrowseProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // plain string
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  // fetch projects from backend with filters
  const buildQueryKey = () => ["projects", selectedCourse, selectedBatch];

  const { data: projects = [], isLoading } = useQuery({
    queryKey: buildQueryKey(),
    queryFn: async () => {
      const params = {};
      if (selectedCourse && selectedCourse !== "all")
        params.course = selectedCourse;
      if (selectedBatch && selectedBatch !== "all")
        params.batch = selectedBatch;
      const { data } = await api.get("/project/get-all", { params });
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const queryClient = useQueryClient();

  const handleDownload = async (project) => {
    try {
      const resp = await api.get(`/project/download/${project.id}`, {
        responseType: "blob",
      });

      // determine filename from content-disposition header or fallback
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

      // refresh projects to get updated download counts
      queryClient.invalidateQueries(buildQueryKey());
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  console.log("fetched projects", projects);

  // Normalize tags: backend may return tags as a JSON string or array
  const normalizedProjects = projects.map((p) => {
    let tags = p.tags;
    if (typeof tags === "string") {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        // fallback: try to clean up common string shapes
        tags = tags
          .replace(/\[|\]|\"/g, "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
    if (!Array.isArray(tags)) tags = [];
    return { ...p, tags };
  });
  const filteredProjects = normalizedProjects.filter((project) => {
    const q = searchQuery.toLowerCase();
    const inTitle = project.title?.toLowerCase().includes(q);
    const inDescription = project.description?.toLowerCase().includes(q);
    const inTags = (project.tags || []).some((tag) =>
      String(tag).toLowerCase().includes(q)
    );
    return inTitle || inDescription || inTags;
  });
  const currentYear = new Date().getFullYear();
  const batches = Array.from({ length: 6 }, (_, i) => currentYear - i);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Browse Projects</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Discover and download projects from students across all courses and
          batches
        </p>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search by title, description, or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            />
          </div>

          <Select
            onValueChange={(v) => setSelectedCourse(v)}
            defaultValue="all"
          >
            <SelectTrigger className="w-full md:w-48 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>

            <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
              <SelectItem value="all" className="dark:text-white">
                All Courses
              </SelectItem>

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

          <Select onValueChange={(v) => setSelectedBatch(v)} defaultValue="all">
            <SelectTrigger className="w-full md:w-48 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
              <SelectItem value="all" className="dark:text-white">
                All Batches
              </SelectItem>
              {batches?.map((batch) => (
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

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>

            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600 dark:text-slate-400">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>

        <Select defaultValue="recent">
          <SelectTrigger className="w-48 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
            <SelectItem value="recent" className="dark:text-white">
              Most Recent
            </SelectItem>
            <SelectItem value="popular" className="dark:text-white">
              Most Popular
            </SelectItem>
            <SelectItem value="downloads" className="dark:text-white">
              Most Downloaded
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* GRID VIEW */}
      {isLoading ? (
        <Card className="p-6">Loading...</Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="p-6 hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-slate-900 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Badge
                    variant="outline"
                    className="dark:border-slate-600 dark:text-slate-300"
                  >
                    {project.course}
                  </Badge>
                  <span>•</span>
                  <span>Batch {project.batch}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[] ||
                    project?.tags?.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="dark:bg-slate-700 dark:text-slate-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {project.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {project.downloads}
                    </div>
                  </div>

                  <Button size="sm" onClick={() => handleDownload(project)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <User className="h-3 w-3" />
                  {project.author}
                  <span>•</span>
                  <Calendar className="h-3 w-3" />
                  {project.created_at
                    ? new Date(project.created_at).toLocaleDateString()
                    : ""}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="p-6 hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="text-slate-900 dark:text-white">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs dark:bg-slate-700 dark:text-slate-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>{project.course}</span>
                    <span>•</span>
                    <span>Batch {project.batch}</span>
                    <span>•</span>
                    <span>{project.author}</span>
                    <span>•</span>
                    <span>
                      {project.created_at
                        ? new Date(project.created_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center gap-4">
                  <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {project.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {project.downloads}
                    </div>
                  </div>

                  <Button onClick={() => handleDownload(project)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
