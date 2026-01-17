import { useState } from "react";
import { Card } from "../components/Card";
import ProjectCard from "../components/ProjectCard";
import ProjectFilters from "../components/ProjectFilters";
import StatusUpdateModal from "../components/StatusUpdateModal";
import useFetchResource from "../hooks/useFetchResource";
import { useQueryClient } from "@tanstack/react-query";
import useEditResource from "../hooks/useEditResource";

export function PendingProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");

  const [selectedProject, setSelectedProject] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const params = new URLSearchParams();
  if (selectedCourse !== "all") params.set("course", selectedCourse);
  if (selectedBatch !== "all") params.set("batch", selectedBatch);

  const resource = `project/get-all${params.toString() ? `?${params}` : ""}`;
  const queryKey = ["projects", selectedCourse, selectedBatch];

  const { data: allProjects = [], isLoading } = useFetchResource(
    resource,
    queryKey
  );
  const editProject = useEditResource("project/status", ["projects"]);

  const queryClient = useQueryClient();
  // const { data: me } = useFetchResource("user/me", "user-me");

  const pendingProjects = allProjects.filter(
    (project) => project.status === "pending"
  );

  const filteredProjects = pendingProjects.filter((project) => {
    const q = searchQuery.toLowerCase();
    return (
      project.title?.toLowerCase().includes(q) ||
      project.description?.toLowerCase().includes(q)
    );
  });

  const openStatusModal = (project) => {
    setSelectedProject(project);
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = (projectId, status) => {
    if (editProject.isPending) return;

    editProject.mutate({ id: projectId, status });
  };

  const currentYear = new Date().getFullYear();
  const batches = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Pending Projects</h1>
        <p className="text-slate-500">Review and update project status</p>
      </div>

      <Card className="p-6 bg-slate-800">
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

      {isLoading ? (
        <p className="text-center">Loading projects...</p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-center text-slate-500">No pending projects found</p>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredProjects.map((project) => (
            <div
              title=" Click to edit the project "
              className="cursor-pointer hover:shadow-lg  rounded-lg transition-shadow "
              key={project.id}
              onClick={() => openStatusModal(project)}
            >
              <ProjectCard project={project} variant={viewMode} />
            </div>
          ))}
        </div>
      )}

      <StatusUpdateModal
        open={statusModalOpen}
        project={selectedProject}
        onClose={() => {
          setStatusModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleStatusUpdate}
      />
    </div>
  );
}
