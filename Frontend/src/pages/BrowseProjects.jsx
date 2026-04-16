import { useState } from "react";
import { Card } from "../components/Card";
import { useToast } from "../components/Toast";
import { Search, Filter, Sparkles } from "lucide-react";
import EditProjectModal from "../components/EditProjectModal";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import ProjectCard from "../components/ProjectCard";
import ProjectFilters from "../components/ProjectFilters";
import useFetchResource from "../hooks/useFetchResource";

export function BrowseProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const toast = useToast();

  // fetch projects from backend with filters using hook
  const params = new URLSearchParams();
  if (selectedCourse && selectedCourse !== "all")
    params.set("course", selectedCourse);
  if (selectedBatch && selectedBatch !== "all")
    params.set("batch", selectedBatch);
  const resource = `project/browse-approved${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  const queryKey = ["projects", selectedCourse, selectedBatch];
  const { data: projects = [], isLoading } = useFetchResource(
    resource,
    queryKey,
  );

  const queryClient = useQueryClient();
  const { data: me } = useFetchResource("user/me", "user-me");

  const [editingProject, setEditingProject] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleDownload = async (project) => {
    try {
      toast.loading("Preparing download...");

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

      toast.success(`Downloaded ${project.title} successfully!`);

      // refresh projects to get updated download counts
      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Failed to download project. Please try again.");
    }
  };

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

    // Ensure all properties are strings, not objects
    return {
      ...p,
      tags,
      title:
        typeof p.title === "object"
          ? p.title.value || p.title.label || ""
          : p.title || "",
      description:
        typeof p.description === "object"
          ? p.description.value || p.description.label || ""
          : p.description || "",
      course:
        typeof p.course === "object"
          ? p.course.value || p.course.label || ""
          : p.course || "",
      batch:
        typeof p.batch === "object"
          ? p.batch.value || p.batch.label || ""
          : p.batch || "",
      department:
        typeof p.department === "object"
          ? p.department.value || p.department.label || ""
          : p.department || "",
      author_name:
        typeof p.author_name === "object"
          ? p.author_name.value || p.author_name.label || ""
          : p.author_name || "",
    };
  });

  const filteredProjects = normalizedProjects.filter((project) => {
    const q = searchQuery.toLowerCase();
    const title = String(project.title || "").toLowerCase();
    const description = String(project.description || "").toLowerCase();
    const inTitle = title.includes(q);
    const inDescription = description.includes(q);
    const inTags = (project.tags || []).some((tag) =>
      String(tag).toLowerCase().includes(q),
    );
    return inTitle || inDescription || inTags;
  });

  const currentYear = new Date().getFullYear();
  const batches = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const handleApprove = async (project) => {
    try {
      await api.put(`/project/admin/approve/${project.id}`);
      toast.success(`${project.title} has been approved!`);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    } catch (err) {
      console.error("Approve failed", err);
      toast.error("Failed to approve project. Please try again.");
    }
  };

  const handleReject = async (project) => {
    try {
      await api.put(`/project/admin/reject/${project.id}`);
      toast.warning(`${project.title} has been rejected.`);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    } catch (err) {
      console.error("Reject failed", err);
      toast.error("Failed to reject project. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-dots-pattern opacity-20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Header Section */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full border border-purple-200/50 dark:border-purple-800/50 mb-4">
            <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Discover Amazing Projects
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent mb-4">
            Browse Projects
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Discover and download innovative projects from students across all
            courses and batches
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-6 glass-morphism border-0 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Filter & Search
            </h3>
          </div>
          <ProjectFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            selectedBatch={selectedBatch}
            setSelectedBatch={setSelectedBatch}
            viewMode={viewMode}
            setViewMode={setViewMode}
            batches={batches}
          />
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Showing{" "}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {filteredProjects.length}
              </span>{" "}
              of <span className="font-bold">{projects.length}</span> projects
            </p>
          </div>
        </div>

        {/* Projects Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="p-6 glass-morphism border-0 backdrop-blur-xl animate-pulse"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="p-12 text-center glass-morphism border-0 backdrop-blur-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search criteria or filters
            </p>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectCard
                  project={project}
                  currentUser={me}
                  currentUserId={me?.id}
                  variant="grid"
                  onEdit={(p) => {
                    setEditingProject(p);
                    setEditOpen(true);
                  }}
                  onDownload={handleDownload}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProjectCard
                  project={project}
                  currentUser={me}
                  currentUserId={me?.id}
                  variant="list"
                  onEdit={(p) => {
                    setEditingProject(p);
                    setEditOpen(true);
                  }}
                  onDownload={handleDownload}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            ))}
          </div>
        )}

        {/* Edit modal */}
        <EditProjectModal
          project={editingProject}
          open={editOpen}
          invalidateKey={queryKey}
          onClose={(success) => {
            setEditOpen(false);
            setEditingProject(null);
            if (success) {
              toast.success("Project updated successfully!");
              queryClient.invalidateQueries({ queryKey: ["my-projects"] });
            }
          }}
        />
      </div>
    </div>
  );
}
