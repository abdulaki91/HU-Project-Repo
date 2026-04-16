import { Button } from "../components/Button";
import { Users, FileText, Download, Eye } from "lucide-react";
import { useState } from "react";
import useFetchResource from "../hooks/useFetchResource";
import ProjectViewModal from "../components/ProjectViewModal";
import { StatsCard } from "../components/dashboard/StatsCard";
import { UploadTrendChart } from "../components/dashboard/UploadTrendChart";
import { CourseDistributionChart } from "../components/dashboard/CourseDistributionChart";
import { WeeklyActivityChart } from "../components/dashboard/WeeklyActivityChart";
import { RecentProjectsTable } from "../components/dashboard/RecentProjectsTable";

export function Dashboard() {
  // Fetch dynamic dashboard data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useFetchResource("project/dashboard/stats", "dashboard-stats");

  // fetch projects from backend
  const { data: projects = [], isLoading: projectsLoading } = useFetchResource(
    "project/browse-approved",
    "projects",
  );

  // fetch current user to know role/department
  const { data: me } = useFetchResource("user/me", "user-me");
  const [viewingProject, setViewingProject] = useState(null);

  // Extract data from API response or use defaults
  const stats = dashboardData?.stats || {};
  const uploadTrends = dashboardData?.uploadTrends || [];
  const courseDistribution = dashboardData?.courseDistribution || [];
  const weeklyActivity = dashboardData?.weeklyActivity || [];

  // Build stats cards from real data
  const statsCards = [
    {
      label: "Total Projects",
      value: stats.total_projects || 0,
      approved: stats.approved_projects || 0,
      pending: stats.pending_projects || 0,
      rejected: stats.rejected_projects || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Active Students",
      value: stats.active_students || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Downloads",
      value: stats.total_downloads || 0,
      icon: Download,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Total Views",
      value: stats.total_views || 0,
      icon: Eye,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  // Prepare chart data with fallbacks
  const uploadTrendData =
    uploadTrends.length > 0 ? uploadTrends : [{ month: "No Data", uploads: 0 }];

  const courseDistributionData =
    courseDistribution.length > 0
      ? courseDistribution
      : [{ name: "No Projects", value: 1, color: "#6b7280" }];

  const weeklyActivityData =
    weeklyActivity.length > 0
      ? weeklyActivity
      : [
          { day: "Mon", views: 0, downloads: 0 },
          { day: "Tue", views: 0, downloads: 0 },
          { day: "Wed", views: 0, downloads: 0 },
          { day: "Thu", views: 0, downloads: 0 },
          { day: "Fri", views: 0, downloads: 0 },
          { day: "Sat", views: 0, downloads: 0 },
          { day: "Sun", views: 0, downloads: 0 },
        ];

  // Show loading state
  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Loading dashboard data...
            </p>
          </div>
        </div>

        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <StatsCard key={index} stat={stat} isLoading={true} />
          ))}
        </div>

        {/* Loading skeleton for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UploadTrendChart data={[]} isLoading={true} hasData={false} />
          <CourseDistributionChart data={[]} isLoading={true} hasData={false} />
        </div>

        <WeeklyActivityChart data={[]} isLoading={true} hasData={false} />
      </div>
    );
  }

  // Show error state
  if (dashboardError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-red-600 dark:text-red-400">
              Failed to load dashboard data. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {me?.role === "admin"
              ? `Department overview for ${me.department}`
              : "Overview of project submissions, engagement, and system performance"}
          </p>
        </div>
        <Button>Export Report</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} stat={stat} isLoading={dashboardLoading} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UploadTrendChart
          data={uploadTrendData}
          isLoading={dashboardLoading}
          hasData={uploadTrends.length > 0}
        />
        <CourseDistributionChart
          data={courseDistributionData}
          isLoading={dashboardLoading}
          hasData={courseDistribution.length > 0}
        />
      </div>

      <WeeklyActivityChart
        data={weeklyActivityData}
        isLoading={dashboardLoading}
        hasData={weeklyActivity.length > 0}
      />

      <RecentProjectsTable
        projects={projects}
        isLoading={projectsLoading}
        currentUser={me}
        onViewProject={setViewingProject}
      />

      {/* Project view modal */}
      <ProjectViewModal
        project={viewingProject}
        open={!!viewingProject}
        currentUser={me}
        onClose={(changed) => {
          setViewingProject(null);
          if (changed) {
            // refresh lists
            // use global react-query keys
          }
        }}
      />
    </div>
  );
}
