// Performance Trends Chart - Stacked Bar
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./chart-container.jsx";

export function PerformanceTrendsChart({ data = [], isLoading, isError }) {
  const isEmpty = !data || data.length === 0;

  return (
    <ChartContainer
      title="Performance Trends"
      subtitle="Commits, Issues và Tasks theo tuần"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="commits" stackId="a" fill="#3b82f6" name="Commits" />
          <Bar dataKey="issues" stackId="a" fill="#f97316" name="Issues" />
          <Bar dataKey="tasks" stackId="a" fill="#10b981" name="Tasks" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}


