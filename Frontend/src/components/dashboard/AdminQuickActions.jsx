import { Card } from "../Card";
import { Button } from "../Button";
import { Badge } from "../Badge";
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Download,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdminQuickActions({ stats, isLoading }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-200 dark:bg-slate-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const quickActions = [
    {
      label: "Review Pending",
      count: stats?.pending_projects || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      action: () => navigate("/pending"),
      urgent: (stats?.pending_projects || 0) > 0,
    },
    {
      label: "Approved Projects",
      count: stats?.approved_projects || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      action: () => navigate("/browse"),
    },
    {
      label: "Active Students",
      count: stats?.active_students || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      action: () => navigate("/dashboard"), // Could link to student management
    },
    {
      label: "Total Downloads",
      count: stats?.total_downloads || 0,
      icon: Download,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      action: () => navigate("/dashboard"), // Could link to analytics
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Quick Actions
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="text-xs"
        >
          <Settings className="h-3 w-3 mr-1" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 text-left
                hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${action.bgColor} ${action.borderColor}
                ${action.urgent ? "ring-2 ring-amber-400 animate-pulse" : ""}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${action.color}`} />
                {action.urgent && (
                  <Badge className="bg-red-500 text-white text-xs px-1 py-0.5">
                    Action Needed
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                <div className={`text-2xl font-bold ${action.color}`}>
                  {action.count}
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {action.label}
                </div>
              </div>

              {action.urgent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            Department Overview
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 dark:text-green-400">
                {stats?.approved_projects || 0} Approved
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-amber-600 dark:text-amber-400">
                {stats?.pending_projects || 0} Pending
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-600 dark:text-red-400">
                {stats?.rejected_projects || 0} Rejected
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
