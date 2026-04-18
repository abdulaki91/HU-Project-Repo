import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import ProjectCard from "../components/ProjectCard";
import ProjectFilters from "../components/ProjectFilters";
import ProjectViewModal from "../components/ProjectViewModal";
import useFetchResource from "../hooks/useFetchResource";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { courses } from "../constants/courses";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Users,
  TrendingUp,
} from "lucide-react";

export function PendingProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const params = new URLSearchParams();
  if (selectedCourse !== "all") params.set("course", selectedCourse);
  if (selectedBatch !== "all") params.set("batch", selectedBatch);

  const resource = `project/admin/department-projects${params.toString() ? `?${params}` : ""}`;
  const queryKey = ["projects", selectedCourse, selectedBatch];

  const { data: allProjects = [], isLoading } = useFetchResource(
    resource,
    queryKey,
  );

  const queryClient = useQueryClient();

  const pendingProjects = allProjects.filter(
    (project) => project.status === "pending",
  );

  const filteredProjects = pendingProjects.filter((project) => {
    const q = searchQuery.toLowerCase();
    return (
      project.title?.toLowerCase().includes(q) ||
      project.description?.toLowerCase().includes(q)
    );
  });

  const openProjectModal = (project) => {
    setSelectedProject(project);
  };

  const currentYear = new Date().getFullYear();
  const batches = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Calculate stats
  const totalPending = pendingProjects.length;
  const totalApproved = allProjects.filter(
    (p) => p.status === "approved",
  ).length;
  const totalRejected = allProjects.filter(
    (p) => p.status === "rejected",
  ).length;

  return (
    <div
      className={`space-y-8 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-200/50 dark:border-amber-800/50">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
            Project Review Center
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-slate-900 dark:from-white dark:via-amber-200 dark:to-white bg-clip-text text-transparent">
          Pending Projects
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Review and approve student project submissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 glass-morphism border-0 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalPending}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Pending Review
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-morphism border-0 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalApproved}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Approved
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-morphism border-0 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalRejected}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Rejected
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-morphism border-0 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {allProjects.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total Projects
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 glass-morphism border-0 backdrop-blur-xl shadow-lg">
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
          courses={courses}
        />
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Loading pending projects...
            </p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12 text-center glass-morphism border-0 backdrop-blur-xl shadow-lg">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              No pending projects found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {searchQuery ||
              selectedCourse !== "all" ||
              selectedBatch !== "all"
                ? "Try adjusting your filters to see more results"
                : "All projects have been reviewed"}
            </p>
          </div>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
          }
        >
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className={`cursor-pointer transition-all duration-500 transform hover:scale-[1.02] ${
                index % 2 === 0
                  ? "animate-slide-in-left"
                  : "animate-slide-in-right"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => openProjectModal(project)}
              title="Click to review and update project status"
            >
              <div className="relative group">
                <ProjectCard
                  project={project}
                  variant={viewMode}
                  className="glass-morphism border-0 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectViewModal
        project={selectedProject}
        open={!!selectedProject}
        currentUser={user}
        onClose={(changed) => {
          setSelectedProject(null);
          if (changed) {
            // Refresh the projects list
            queryClient.invalidateQueries(queryKey);
            queryClient.invalidateQueries(["dashboard-stats"]);
          }
        }}
      />
    </div>
  );
}
