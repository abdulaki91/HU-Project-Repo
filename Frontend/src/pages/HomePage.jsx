import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import {
  FileText,
  TrendingUp,
  Code,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { useToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    {
      label: "Total Projects",
      value: "1,247",
      change: "+12%",
      icon: FileText,
      color:
        "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-400",
    },
    {
      label: "This Month",
      value: "89",
      change: "+23%",
      icon: TrendingUp,
      color:
        "bg-gradient-to-br from-green-50 to-green-100 text-green-600 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-400",
    },
    {
      label: "Technologies",
      value: "45",
      change: "+5",
      icon: Code,
      color:
        "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 dark:from-purple-900/20 dark:to-purple-800/20 dark:text-purple-400",
    },
    {
      label: "Top Rated",
      value: "156",
      change: "+8%",
      icon: Award,
      color:
        "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 dark:from-amber-900/20 dark:to-amber-800/20 dark:text-amber-400",
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
      featured: true,
    },
    {
      id: 2,
      title: "E-Commerce Platform with Payment Integration",
      course: "Web Development",
      batch: "2024",
      tags: ["React", "Node.js", "MongoDB"],
      uploadedBy: "Michael Chen",
      uploadedAt: "5 hours ago",
      featured: false,
    },
    {
      id: 3,
      title: "Mobile Health Tracking Application",
      course: "Mobile App Development",
      batch: "2023",
      tags: ["Flutter", "Firebase", "Dart"],
      uploadedBy: "Emily Rodriguez",
      uploadedAt: "1 day ago",
      featured: false,
    },
  ];

  const topTechnologies = [
    {
      name: "React",
      count: 234,
      color: "bg-gradient-to-r from-cyan-500 to-blue-500",
    },
    {
      name: "Python",
      count: 198,
      color: "bg-gradient-to-r from-blue-500 to-indigo-500",
    },
    {
      name: "Java",
      count: 167,
      color: "bg-gradient-to-r from-red-500 to-pink-500",
    },
    {
      name: "Node.js",
      count: 145,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      name: "Flutter",
      count: 123,
      color: "bg-gradient-to-r from-sky-500 to-cyan-500",
    },
  ];

  const maxCount = Math.max(...topTechnologies.map((t) => t.count));

  const handleExploreProjects = () => {
    navigate("/browse");
    toast.success("Exploring amazing projects!");
  };

  const handleUploadProject = () => {
    navigate("/upload");
    toast.info("Ready to share your project?");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div
        className={`relative z-10 space-y-8 p-6 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Welcome to the Future of Project Sharing
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent mb-6 leading-tight">
            ProjectNest
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover, share, and preserve innovative student projects from
            across campus. Join a community of creators and innovators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleExploreProjects}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Explore Projects
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={handleUploadProject}
              variant="outline"
              className="border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-8 py-3 rounded-xl transition-all duration-300"
            >
              Upload Your Project
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="p-6 glass-morphism hover:glass-morphism-dark transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color} shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Latest Uploads and Top Technologies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Uploads */}
          <Card className="lg:col-span-2 p-8 glass-morphism border-0 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Latest Uploads
              </h2>
              <Button
                variant="ghost"
                onClick={() => navigate("/browse")}
                className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {latestUploads.map((project, index) => (
                <div
                  key={project.id}
                  className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg ${
                    project.featured
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800"
                      : "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex-1 leading-tight">
                      {project.title}
                    </h3>
                    {project.featured && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 ml-2">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 font-medium">
                    {project.course} • Batch {project.batch}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-medium">by {project.uploadedBy}</span>
                    <span>{project.uploadedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Technologies */}
          <Card className="p-8 glass-morphism border-0 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Top Technologies
            </h2>
            <div className="space-y-6">
              {topTechnologies.map((tech, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {tech.name}
                    </span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                      {tech.count}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full ${tech.color} transition-all duration-1000 ease-out shadow-sm`}
                      style={{
                        width: isLoaded
                          ? `${(tech.count / maxCount) * 100}%`
                          : "0%",
                        animationDelay: `${index * 200}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
