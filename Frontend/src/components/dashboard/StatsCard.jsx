import { Card } from "../Card";

export function StatsCard({ stat, isLoading }) {
  const Icon = stat.icon;

  if (isLoading) {
    return (
      <Card className="p-6 dark:bg-slate-800 dark:border-slate-700 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
          <div className="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            {stat.label}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {stat.value.toLocaleString()}
          </p>
          {stat.approved !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-600">✓ {stat.approved}</span>
              <span className="text-amber-600">⏳ {stat.pending}</span>
              <span className="text-red-600">✗ {stat.rejected}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${stat.bgColor} dark:bg-opacity-20`}>
          <Icon className={`h-5 w-5 ${stat.color}`} />
        </div>
      </div>
    </Card>
  );
}
