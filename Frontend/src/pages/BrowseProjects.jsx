import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/Select";

import {
  Search,
  Download,
  Eye,
  Grid3x3,
  List,
  Calendar,
  User,
} from "lucide-react";

export function BrowseProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // plain string

  const projects = [
    {
      id: 1,
      title: "AI-Powered Chatbot for Student Support",
      description:
        "Intelligent chatbot system that assists students with course inquiries, academic guidance, and administrative questions.",
      course: "Artificial Intelligence",
      batch: "2024",
      tags: ["Python", "NLP", "TensorFlow", "Flask"],
      author: "Sarah Johnson",
      date: "2024-03-15",
      downloads: 245,
      views: 1203,
    },
    {
      id: 2,
      title: "E-Commerce Platform with Payment Integration",
      description:
        "Full-stack e-commerce application featuring product catalog, shopping cart, and secure payment processing.",
      course: "Web Development",
      batch: "2024",
      tags: ["React", "Node.js", "MongoDB", "Stripe"],
      author: "Michael Chen",
      date: "2024-03-14",
      downloads: 189,
      views: 876,
    },
    {
      id: 3,
      title: "Mobile Health Tracking Application",
      description:
        "Cross-platform mobile app for tracking fitness activities, nutrition, and health metrics with real-time sync.",
      course: "Mobile App Development",
      batch: "2023",
      tags: ["Flutter", "Firebase", "Dart"],
      author: "Emily Rodriguez",
      date: "2024-03-12",
      downloads: 156,
      views: 654,
    },
    {
      id: 4,
      title: "Blockchain-Based Supply Chain Management",
      description:
        "Decentralized supply chain tracking system using blockchain for transparency and security.",
      course: "Blockchain Technology",
      batch: "2024",
      tags: ["Solidity", "Ethereum", "Web3.js"],
      author: "David Park",
      date: "2024-03-10",
      downloads: 198,
      views: 934,
    },
    {
      id: 5,
      title: "Machine Learning Stock Price Predictor",
      description:
        "Advanced ML model for predicting stock market trends using historical data and sentiment analysis.",
      course: "Data Science",
      batch: "2023",
      tags: ["Python", "Scikit-learn", "Pandas", "LSTM"],
      author: "Aisha Patel",
      date: "2024-03-08",
      downloads: 287,
      views: 1456,
    },
    {
      id: 6,
      title: "Smart Home IoT Control System",
      description:
        "IoT-based home automation system with mobile app control and voice integration.",
      course: "Internet of Things",
      batch: "2024",
      tags: ["Arduino", "Raspberry Pi", "MQTT"],
      author: "James Wilson",
      date: "2024-03-05",
      downloads: 134,
      views: 723,
    },
  ];

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search by title, description, or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            />
          </div>

          <Select>
            <SelectTrigger className="w-full md:w-48 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
              <SelectItem value="all" className="dark:text-white">
                All Courses
              </SelectItem>
              <SelectItem value="ai" className="dark:text-white">
                Artificial Intelligence
              </SelectItem>
              <SelectItem value="web" className="dark:text-white">
                Web Development
              </SelectItem>
              <SelectItem value="mobile" className="dark:text-white">
                Mobile Development
              </SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-full md:w-48 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
              <SelectItem value="all" className="dark:text-white">
                All Batches
              </SelectItem>
              <SelectItem value="2024" className="dark:text-white">
                2024
              </SelectItem>
              <SelectItem value="2023" className="dark:text-white">
                2023
              </SelectItem>
              <SelectItem value="2022" className="dark:text-white">
                2022
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>

            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="p-6 hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-slate-900 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Badge
                    variant="outline"
                    className="dark:border-slate-600 dark:text-slate-300"
                  >
                    {project.course}
                  </Badge>
                  <span>•</span>
                  <span>Batch {project.batch}</span>
                </div>

                <div className="flex flex-wrap gap-2">
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

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {project.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {project.downloads}
                    </div>
                  </div>

                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <User className="h-3 w-3" />
                  {project.author}
                  <span>•</span>
                  <Calendar className="h-3 w-3" />
                  {new Date(project.date).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="p-6 hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="text-slate-900 dark:text-white">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs dark:bg-slate-700 dark:text-slate-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>{project.course}</span>
                    <span>•</span>
                    <span>Batch {project.batch}</span>
                    <span>•</span>
                    <span>{project.author}</span>
                    <span>•</span>
                    <span>{new Date(project.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center gap-4">
                  <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {project.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {project.downloads}
                    </div>
                  </div>

                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
