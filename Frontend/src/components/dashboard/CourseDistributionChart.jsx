import { Card } from "../Card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function CourseDistributionChart({ data, isLoading, hasData }) {
  if (isLoading) {
    return (
      <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-40"></div>
        <div className="h-[300px] bg-slate-100 dark:bg-slate-700 rounded animate-pulse"></div>
      </Card>
    );
  }

  return (
    <Card className="p-6 dark:bg-slate-800 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Course Distribution
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              hasData ? `${name} ${(percent * 100).toFixed(0)}%` : name
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
