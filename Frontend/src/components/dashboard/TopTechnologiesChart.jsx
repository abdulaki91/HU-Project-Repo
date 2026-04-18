import { Card } from "../Card";
import { Badge } from "../Badge";
import { Code, TrendingUp, Hash } from "lucide-react";

export function TopTechnologiesChart({ data, isLoading, hasData }) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Top Technologies
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!hasData || !data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Top Technologies
          </h3>
        </div>
        <div className="text-center py-8">
          <Code className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No technology data available
          </p>
        </div>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((t) => t.count));

  // Technology icons mapping
  const getTechIcon = (techName) => {
    const name = techName.toLowerCase();
    if (name.includes("react")) return "⚛️";
    if (name.includes("python")) return "🐍";
    if (name.includes("java")) return "☕";
    if (name.includes("node")) return "🟢";
    if (name.includes("flutter")) return "💙";
    if (name.includes("javascript") || name.includes("js")) return "🟨";
    if (name.includes("typescript") || name.includes("ts")) return "🔷";
    if (name.includes("php")) return "🐘";
    if (name.includes("mysql")) return "🗄️";
    if (name.includes("mongodb")) return "🍃";
    if (name.includes("firebase")) return "🔥";
    if (name.includes("docker")) return "🐳";
    if (name.includes("kubernetes")) return "⚙️";
    if (name.includes("aws")) return "☁️";
    if (name.includes("machine-learning") || name.includes("ml")) return "🤖";
    if (name.includes("ai")) return "🧠";
    if (name.includes("web")) return "🌐";
    if (name.includes("mobile")) return "📱";
    if (name.includes("desktop")) return "💻";
    return "🔧";
  };

  // Color scheme for bars
  const getBarColor = (index) => {
    const colors = [
      "bg-gradient-to-r from-blue-500 to-blue-600",
      "bg-gradient-to-r from-green-500 to-green-600",
      "bg-gradient-to-r from-purple-500 to-purple-600",
      "bg-gradient-to-r from-orange-500 to-orange-600",
      "bg-gradient-to-r from-pink-500 to-pink-600",
      "bg-gradient-to-r from-indigo-500 to-indigo-600",
      "bg-gradient-to-r from-teal-500 to-teal-600",
      "bg-gradient-to-r from-red-500 to-red-600",
      "bg-gradient-to-r from-yellow-500 to-yellow-600",
      "bg-gradient-to-r from-cyan-500 to-cyan-600",
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Top Technologies
          </h3>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Hash className="h-3 w-3" />
          {data.length} Technologies
        </Badge>
      </div>

      <div className="space-y-4">
        {data.map((tech, index) => {
          const percentage = (tech.count / maxCount) * 100;
          const isTop3 = index < 3;

          return (
            <div key={tech.name} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTechIcon(tech.name)}</span>
                  <span className="font-medium text-slate-900 dark:text-white capitalize">
                    {tech.name.replace(/-/g, " ")}
                  </span>
                  {isTop3 && (
                    <Badge
                      className={`text-xs ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                          : index === 1
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200"
                      }`}
                    >
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}#
                      {index + 1}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {tech.count}
                  </span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${getBarColor(index)} shadow-sm`}
                    style={{
                      width: `${percentage}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                </div>

                {/* Percentage label */}
                <div
                  className="absolute top-0 h-3 flex items-center justify-end pr-2 text-xs font-medium text-white"
                  style={{ width: `${Math.max(percentage, 20)}%` }}
                >
                  {percentage > 15 && `${percentage.toFixed(0)}%`}
                </div>
              </div>

              {/* Usage indicator */}
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Used in {tech.count} project{tech.count !== 1 ? "s" : ""}
                </span>
                <span>{percentage.toFixed(1)}% of projects</span>
              </div>
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <Code className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No technologies found in approved projects
          </p>
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Based on approved project tags</span>
            <span>
              Total: {data.reduce((sum, tech) => sum + tech.count, 0)} uses
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
