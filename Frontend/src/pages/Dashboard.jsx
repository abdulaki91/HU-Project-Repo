import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/Table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export function Dashboard() {
  const stats = [
    {
      label: "Total Projects",
      value: "1,247",
      change: "+12.3%",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Active Students",
      value: "856",
      change: "+8.1%",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Downloads",
      value: "15,432",
      change: "+23.5%",
      icon: Download,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Total Views",
      value: "48,291",
      change: "+18.2%",
      icon: Eye,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  const uploadTrend = [
    { month: "Jan", uploads: 65 },
    { month: "Feb", uploads: 78 },
    { month: "Mar", uploads: 90 },
    { month: "Apr", uploads: 81 },
    { month: "May", uploads: 95 },
    { month: "Jun", uploads: 112 },
  ];

  const courseDistribution = [
    { name: "Web Dev", value: 234, color: "#3b82f6" },
    { name: "AI/ML", value: 198, color: "#8b5cf6" },
    { name: "Mobile", value: 167, color: "#10b981" },
    { name: "Data Science", value: 145, color: "#f59e0b" },
    { name: "Cloud", value: 123, color: "#ef4444" },
    { name: "Others", value: 380, color: "#6b7280" },
  ];

  const activityData = [
    { day: "Mon", views: 420, downloads: 85 },
    { day: "Tue", views: 380, downloads: 72 },
    { day: "Wed", views: 510, downloads: 98 },
    { day: "Thu", views: 450, downloads: 88 },
    { day: "Fri", views: 620, downloads: 115 },
    { day: "Sat", views: 290, downloads: 45 },
    { day: "Sun", views: 250, downloads: 38 },
  ];

  const recentProjects = [
    {
      id: 1,
      title: "AI Chatbot System",
      author: "Sarah Johnson",
      course: "Artificial Intelligence",
      status: "approved",
      date: "2024-03-15",
      downloads: 45,
    },
    {
      id: 2,
      title: "E-Commerce Platform",
      author: "Michael Chen",
      course: "Web Development",
      status: "pending",
      date: "2024-03-14",
      downloads: 32,
    },
    {
      id: 3,
      title: "Health Tracking App",
      author: "Emily Rodriguez",
      course: "Mobile Development",
      status: "approved",
      date: "2024-03-12",
      downloads: 28,
    },
    {
      id: 4,
      title: "Blockchain Supply Chain",
      author: "David Park",
      course: "Blockchain",
      status: "approved",
      date: "2024-03-10",
      downloads: 51,
    },
    {
      id: 5,
      title: "Stock Price Predictor",
      author: "Aisha Patel",
      course: "Data Science",
      status: "review",
      date: "2024-03-08",
      downloads: 67,
    },
  ];

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
      case "review":
        return (
          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            <AlertCircle className="h-3 w-3 mr-1" /> In Review
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Overview of project submissions, engagement, and system performance
          </p>
        </div>
        <Button>Export Report</Button>
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
                <div className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg ${stat.bgColor} dark:bg-opacity-20`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-slate-900 dark:text-white mb-4">Upload Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={uploadTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                className="dark:stroke-slate-700"
              />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                className="dark:stroke-slate-400"
              />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--tooltip-bg, white)",
                  border: "1px solid var(--tooltip-border, #e2e8f0)",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="uploads"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-slate-900 dark:text-white mb-4">
            Course Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {courseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
        <h2 className="text-slate-900 dark:text-white mb-4">Weekly Activity</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              className="dark:stroke-slate-700"
            />
            <XAxis
              dataKey="day"
              stroke="#64748b"
              className="dark:stroke-slate-400"
            />
            <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, white)",
                border: "1px solid var(--tooltip-border, #e2e8f0)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="views" fill="#6366f1" radius={[8, 8, 0, 0]} />
            <Bar dataKey="downloads" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 dark:text-white">Recent Projects</h2>
          <Tabs defaultValue="all">
            <TabsList className="dark:bg-slate-700">
              <TabsTrigger
                value="all"
                className="dark:data-[state=active]:bg-slate-600"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="dark:data-[state=active]:bg-slate-600"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="dark:data-[state=active]:bg-slate-600"
              >
                Approved
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="dark:border-slate-700">
              <TableHead className="dark:text-slate-300">
                Project Title
              </TableHead>
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
            {recentProjects.map((project) => (
              <TableRow key={project.id} className="dark:border-slate-700">
                <TableCell className="dark:text-white">
                  {project.title}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {project.author}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {project.course}
                </TableCell>
                <TableCell>{getStatusBadge(project.status)}</TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {new Date(project.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right text-slate-600 dark:text-slate-400">
                  {project.downloads}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="dark:hover:bg-slate-700"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
