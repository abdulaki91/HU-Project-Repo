import { useState } from "react";
import { Card } from "../Card";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Tabs, TabsList, TabsTrigger } from "../Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Table";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export function RecentProjectsTable({
  projects,
  isLoading,
  currentUser,
  onViewProject,
}) {
  const [activeTab, setActiveTab] = useState("all");

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-50 text-green-700 hover:bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-50 text-red-700 hover:bg-red-50">
            <AlertCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredProjects = projects
    .filter((project) => {
      if (activeTab === "all") return true;
      return project.status === activeTab;
    })
    // If user is admin, limit pending to their department
    .filter((project) => {
      if (
        currentUser &&
        currentUser.role === "admin" &&
        activeTab === "pending"
      ) {
        return project.department === currentUser.department;
      }
      return true;
    })
    .slice(0, 10); // Show only first 10 projects

  return (
    <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recent Projects
        </h2>
        <Tabs defaultValue="all" onValueChange={(v) => setActiveTab(v)}>
          <TabsList className="dark:bg-slate-700">
            <TabsTrigger
              value="all"
              className="dark:data-[state=active]:bg-slate-600"
            >
              All ({projects.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="dark:data-[state=active]:bg-slate-600"
            >
              Pending ({projects.filter((p) => p.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="dark:data-[state=active]:bg-slate-600"
            >
              Approved ({projects.filter((p) => p.status === "approved").length}
              )
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="dark:border-slate-700">
            <TableHead className="dark:text-slate-300">Project Title</TableHead>
            <TableHead className="dark:text-slate-300">Author</TableHead>
            <TableHead className="dark:text-slate-300">Course</TableHead>
            <TableHead className="dark:text-slate-300">Status</TableHead>
            <TableHead className="dark:text-slate-300">Date</TableHead>
            <TableHead className="text-right dark:text-slate-300">
              Downloads
            </TableHead>
            <TableHead className="text-right dark:text-slate-300">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                Loading projects...
              </TableCell>
            </TableRow>
          ) : projects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-slate-500"
              >
                No projects found
              </TableCell>
            </TableRow>
          ) : (
            filteredProjects.map((project) => (
              <TableRow key={project.id} className="dark:border-slate-700">
                <TableCell className="dark:text-white font-medium">
                  {project.title}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {project.author_name || project.author}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {project.course}
                </TableCell>
                <TableCell>{getStatusBadge(project.status)}</TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {project.created_at
                    ? new Date(project.created_at).toLocaleDateString()
                    : ""}
                </TableCell>
                <TableCell className="text-right text-slate-600 dark:text-slate-400">
                  {project.downloads || 0}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="dark:hover:bg-slate-700"
                    onClick={() => onViewProject(project)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
