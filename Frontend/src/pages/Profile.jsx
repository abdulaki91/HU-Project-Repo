import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Textarea } from "../components/Textarea";
import { Badge } from "../components/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import { Avatar, AvatarFallback } from "../components/Avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  FileText,
  Download,
  Settings,
} from "lucide-react";

export function Profile() {
  const userProjects = [
    {
      id: 1,
      title: "AI-Powered Chatbot for Student Support",
      course: "Artificial Intelligence",
      date: "2024-03-15",
      downloads: 245,
      views: 1203,
      status: "Published",
    },
    {
      id: 2,
      title: "E-Commerce Platform with Payment Integration",
      course: "Web Development",
      date: "2024-02-20",
      downloads: 189,
      views: 876,
      status: "Published",
    },
    {
      id: 3,
      title: "Machine Learning Image Classifier",
      course: "Machine Learning",
      date: "2024-01-10",
      downloads: 312,
      views: 1456,
      status: "Published",
    },
  ];

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
                  JD
                </AvatarFallback>
              </Avatar>
              <h2 className="text-slate-900 dark:text-white mb-1">John Doe</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Computer Science Student
              </p>
              <Badge
                variant="secondary"
                className="dark:bg-slate-700 dark:text-slate-300"
              >
                Batch 2024
              </Badge>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4" />{" "}
                <span>john.doe@university.edu</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="h-4 w-4" /> <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <MapPin className="h-4 w-4" /> <span>New York, USA</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" /> <span>Joined March 2023</span>
              </div>
            </div>

            <Button
              className="w-full mt-6 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              variant="outline"
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

          {/* Stats */}
          <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-slate-900 dark:text-white mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <FileText className="h-4 w-4" /> <span>Projects</span>
                </div>
                <span className="text-slate-900 dark:text-white">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Download className="h-4 w-4" /> <span>Total Downloads</span>
                </div>
                <span className="text-slate-900 dark:text-white">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <User className="h-4 w-4" /> <span>Profile Views</span>
                </div>
                <span className="text-slate-900 dark:text-white">567</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="projects" className="space-y-6">
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
              {userProjects.map((project) => (
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
                          {new Date(project.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      {project.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />{" "}
                        <span>{project.downloads} downloads</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />{" "}
                        <span>{project.views} views</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="dark:hover:bg-slate-700"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="settings">
              <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-slate-900 dark:text-white mb-6">
                  Account Settings
                </h3>
                <form className="space-y-6">
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
                        defaultValue="John"
                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="dark:text-slate-200">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        defaultValue="Doe"
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
                      defaultValue="john.doe@university.edu"
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="dark:text-slate-200">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="dark:text-slate-200">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      className="min-h-24 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                      defaultValue="Computer Science student passionate about AI and web development. Always eager to learn new technologies and collaborate on innovative projects."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="dark:text-slate-200">
                      Location
                    </Label>
                    <Input
                      id="location"
                      defaultValue="New York, USA"
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit">Save Changes</Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
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
