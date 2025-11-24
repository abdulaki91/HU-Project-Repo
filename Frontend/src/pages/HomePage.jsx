import { Card } from "../components/Card";
import { FileText, TrendingUp, Code, Award } from "lucide-react";
import { Badge } from "../components/Badge";

export function HomePage() {
  const stats = [
    {
      label: "Total Projects",
      value: "1,247",
      change: "+12%",
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "This Month",
      value: "89",
      change: "+23%",
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Technologies",
      value: "45",
      change: "+5",
      icon: Code,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Top Rated",
      value: "156",
      change: "+8%",
      icon: Award,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const latestUploads = [
    {
      id: 1,
      title: "AI-Powered Chatbot for Student Support",
      course: "Artificial Intelligence",
      batch: "2024",
      tags: ["Python", "NLP", "TensorFlow"],
      uploadedBy: "Sarah Johnson",
      uploadedAt: "2 hours ago",
    },
    {
      id: 2,
      title: "E-Commerce Platform with Payment Integration",
      course: "Web Development",
      batch: "2024",
      tags: ["React", "Node.js", "MongoDB"],
      uploadedBy: "Michael Chen",
      uploadedAt: "5 hours ago",
    },
    {
      id: 3,
      title: "Mobile Health Tracking Application",
      course: "Mobile App Development",
      batch: "2023",
      tags: ["Flutter", "Firebase", "Dart"],
      uploadedBy: "Emily Rodriguez",
      uploadedAt: "1 day ago",
    },
  ];

  const topTechnologies = [
    { name: "React", count: 234, color: "bg-cyan-500" },
    { name: "Python", count: 198, color: "bg-blue-500" },
    { name: "Java", count: 167, color: "bg-red-500" },
    { name: "Node.js", count: 145, color: "bg-green-500" },
    { name: "Flutter", count: 123, color: "bg-sky-500" },
  ];

  const maxCount = Math.max(...topTechnologies.map((t) => t.count));

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">
          Welcome to ProjectNest
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Explore, share, and preserve innovative student projects from across
          campus
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="p-6 dark:bg-slate-800 dark:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {stat.change} from last month
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${stat.color} dark:bg-opacity-20`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Latest Uploads and Top Technologies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Uploads */}
        <Card className="lg:col-span-2 p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-slate-900 dark:text-white mb-4">
            Latest Uploads
          </h2>
          <div className="space-y-4">
            {latestUploads.map((project) => (
              <div
                key={project.id}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-slate-900 dark:text-white flex-1">
                    {project.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {project.course} • Batch {project.batch}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="dark:bg-slate-700 dark:text-slate-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>by {project.uploadedBy}</span>
                  <span>{project.uploadedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Technologies */}
        <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-slate-900 dark:text-white mb-4">
            Top Technologies
          </h2>
          <div className="space-y-4">
            {topTechnologies.map((tech, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-700 dark:text-slate-300">
                    {tech.name}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {tech.count}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${tech.color}`}
                    style={{ width: `${(tech.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
