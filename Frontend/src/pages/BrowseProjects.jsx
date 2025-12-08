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

import { Search, Download, Grid3x3, List, Calendar, User } from "lucide-react";
import EditProjectModal from "../components/EditProjectModal";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import ProjectCard from "../components/ProjectCard";
import ProjectFilters from "../components/ProjectFilters";
import { formatBytes } from "../utils/utils";
import useFetchResource from "../hooks/useFetchResource";

export function BrowseProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // plain string
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  // fetch projects from backend with filters using hook
  const params = new URLSearchParams();
  if (selectedCourse && selectedCourse !== "all")
    params.set("course", selectedCourse);
  if (selectedBatch && selectedBatch !== "all")
    params.set("batch", selectedBatch);
  const resource = `project/get-all${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  const queryKey = ["projects", selectedCourse, selectedBatch];
  const { data: projects = [], isLoading } = useFetchResource(
    resource,
    queryKey
  );

  const queryClient = useQueryClient();
  const { data: me } = useFetchResource("user/me", "user-me");

  const [editingProject, setEditingProject] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

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
      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      console.error("Download failed", err);
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
            <ProjectCard
              key={project.id}
              project={project}
              currentUser={me}
              currentUserId={me?.id}
              variant="grid"
              onEdit={(p) => {
                setEditingProject(p);
                setEditOpen(true);
              }}
              onDownload={handleDownload}
              onApprove={async (p) => {
                try {
                  await api.put(`/project/status/${p.id}`, {
                    status: "approved",
                  });
                  queryClient.invalidateQueries({ queryKey });
                  queryClient.invalidateQueries({ queryKey: ["my-projects"] });
                } catch (err) {
                  console.error("Approve failed", err);
                }
              }}
              onReject={async (p) => {
                try {
                  await api.put(`/project/status/${p.id}`, {
                    status: "rejected",
                  });
                  queryClient.invalidateQueries({ queryKey });
                  queryClient.invalidateQueries({ queryKey: ["my-projects"] });
                } catch (err) {
                  console.error("Reject failed", err);
                }
              }}
            />
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUser={me}
              currentUserId={me?.id}
              variant="list"
              onEdit={(p) => {
                setEditingProject(p);
                setEditOpen(true);
              }}
              onDownload={handleDownload}
              onApprove={async (p) => {
                try {
                  await api.put(`/project/status/${p.id}`, {
                    status: "approved",
                  });
                  queryClient.invalidateQueries({ queryKey });
                  queryClient.invalidateQueries({ queryKey: ["my-projects"] });
                } catch (err) {
                  console.error("Approve failed", err);
                }
              }}
              onReject={async (p) => {
                try {
                  await api.put(`/project/status/${p.id}`, {
                    status: "rejected",
                  });
                  queryClient.invalidateQueries({ queryKey });
                  queryClient.invalidateQueries({ queryKey: ["my-projects"] });
                } catch (err) {
                  console.error("Reject failed", err);
                }
              }}
            />
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
            // ensure user's own project list also refreshes
            queryClient.invalidateQueries({ queryKey: ["my-projects"] });
          }
        }}
      />
    </div>
  );
}
