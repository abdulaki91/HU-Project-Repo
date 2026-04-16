import { Card } from "../Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function UploadTrendChart({ data, isLoading, hasData }) {
  if (isLoading) {
    return (
      <Card className="lg:col-span-2 p-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-32"></div>
        <div className="h-[300px] bg-slate-100 dark:bg-slate-700 rounded animate-pulse"></div>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 p-6 dark:bg-slate-800 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Upload Trend ({hasData ? "Last 6 Months" : "No Data"})
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
  );
}
