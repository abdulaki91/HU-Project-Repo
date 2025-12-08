import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Badge } from "../components/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import { Avatar, AvatarFallback } from "../components/Avatar";
import { Mail, Calendar, Award, Download, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import useEditResource from "../hooks/useEditResource";
import useFetchResource from "../hooks/useFetchResource";
import api from "../api/api";
import { useQueryClient } from "@tanstack/react-query";
import EditProjectModal from "../components/EditProjectModal";
const achievements = [
  {
    title: "Top Contributor",
    description: "Uploaded 5+ projects",
    icon: Award,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Popular Project",
    description: "200+ downloads on a project",
    icon: Download,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Early Adopter",
    description: "Member since 2023",
    icon: Calendar,
    color: "bg-green-50 text-green-600",
  },
];

export function Profile() {
  const { data: userProjects = [], isLoading } = useFetchResource(
    "project/my",
    "my-projects"
  );

  const [tabValue, setTabValue] = useState("projects");
  const [userInfo, setUserInfo] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    batch: "",
    department: "",
    created_at: null,
  });

  const { data: userData, isLoading: userLoading } = useFetchResource(
    "user/me",
    "user-me"
  );

  useEffect(() => {
    if (userData) setUserInfo((prev) => ({ ...prev, ...userData }));
  }, [userData]);

  const editUser = useEditResource("user/update", "user-me");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userInfo.id) {
      alert("Unable to update: user id not available yet.");
      return;
    }
    const payload = {
      id: userInfo.id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      batch: userInfo.batch,
      department: userInfo.department,
    };

    editUser.mutate(payload, {
      onSuccess: () => {
        setTabValue("projects");
      },
    });
  };

  const queryClient = useQueryClient();

  const [editingProject, setEditingProject] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const formatBytes = (bytes) => {
    if (bytes === null || bytes === undefined) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = async (project) => {
    try {
      const resp = await api.get(`/project/download/${project.id}`, {
        responseType: "blob",
      });
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

      queryClient.invalidateQueries(["my-projects"]);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Profile</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account information and view your contributions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-2xl">
                  {userInfo.firstName && userInfo.lastName
                    ? `${userInfo.firstName[0] || ""}${
                        userInfo.lastName[0] || ""
                      }`.toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-slate-900 dark:text-white mb-1">
                {userInfo.firstName || ""} {userInfo.lastName || ""}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {userInfo.department || "Student"}
              </p>
              <Badge
                variant="secondary"
                className="dark:bg-slate-700 dark:text-slate-300"
              >
                {userInfo.batch || "Batch TBD"}
              </Badge>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4" />{" "}
                <span>{userInfo.email || "-"}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {userInfo.created_at
                    ? new Date(userInfo.created_at).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>

            <Button
              className="w-full mt-6 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              variant="outline"
              onClick={() => setTabValue("settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Card>

          {/* Achievements */}
          <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-slate-900 dark:text-white mb-4">
              Achievements
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${achievement.color} dark:bg-opacity-20`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 dark:text-white">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs
            value={tabValue}
            onValueChange={setTabValue}
            className="space-y-6"
          >
            <TabsList className="dark:bg-slate-800">
              <TabsTrigger
                value="projects"
                className="dark:data-[state=active]:bg-slate-700"
              >
                My Projects
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="dark:data-[state=active]:bg-slate-700"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              {isLoading && <Card className="p-6">Loading...</Card>}
              {!isLoading &&
                userProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="p-6 hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-slate-900 dark:text-white mb-2">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Badge
                            variant="outline"
                            className="dark:border-slate-600 dark:text-slate-300"
                          >
                            {project.course}
                          </Badge>
                          <span>•</span>
                          <span>
                            {project.created_at
                              ? new Date(
                                  project.created_at
                                ).toLocaleDateString()
                              : ""}
                          </span>
                          {project.file_size ? (
                            <>
                              <span>•</span>
                              <span>{formatBytes(project.file_size)}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {project.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4" />{" "}
                            <span>{project.downloads} downloads</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                            onClick={() => {
                              setEditingProject(project);
                              setEditOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="dark:hover:bg-slate-700"
                            onClick={() => handleDownload(project)}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              <EditProjectModal
                project={editingProject}
                open={editOpen}
                onClose={(saved) => {
                  setEditOpen(false);
                  setEditingProject(null);
                  if (saved)
                    queryClient.invalidateQueries({
                      queryKey: ["my-projects"],
                    });
                }}
              />
            </TabsContent>

            <TabsContent value="settings">
              <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-slate-900 dark:text-white mb-6">
                  Account Settings
                </h3>
                <form className="space-y-6" onSubmit={handleSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="dark:text-slate-200"
                      >
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={userInfo.firstName}
                        onChange={handleInputChange}
                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="dark:text-slate-200">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={userInfo.lastName}
                        onChange={handleInputChange}
                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-slate-200">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={handleInputChange}
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="batch" className="dark:text-slate-200">
                        Batch
                      </Label>
                      <Input
                        id="batch"
                        value={userInfo.batch}
                        onChange={handleInputChange}
                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="department"
                        className="dark:text-slate-200"
                      >
                        Department
                      </Label>
                      <Input
                        id="department"
                        value={userInfo.department}
                        onChange={handleInputChange}
                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit">Save Changes</Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      onClick={() => setTabValue("projects")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
