import { Card } from "../Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function WeeklyActivityChart({ data, isLoading, hasData }) {
  if (isLoading) {
    return (
      <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-32"></div>
        <div className="h-[300px] bg-slate-100 dark:bg-slate-700 rounded animate-pulse"></div>
      </Card>
    );
  }

  return (
    <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Weekly Activity ({hasData ? "Last 7 Days" : "No Data"})
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
          <Bar
            dataKey="views"
            fill="#6366f1"
            radius={[8, 8, 0, 0]}
            name="Views"
          />
          <Bar
            dataKey="downloads"
            fill="#8b5cf6"
            radius={[8, 8, 0, 0]}
            name="Downloads"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
