// Weekly Activity Trends Chart - Stacked Area hoặc Multi Line
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./chart-container.jsx";

export function WeeklyTrendsChart({ data = [], isLoading, isError }) {
  const isEmpty = !data || data.length === 0;

  return (
    <ChartContainer
      title="Weekly Activity Trends"
      subtitle="Commits, Issues và Tasks theo ngày"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="commits"
            stackId="1"
            stroke="#3b82f6"
            fill="url(#colorCommits)"
            name="Commits"
          />
          <Area
            type="monotone"
            dataKey="issuesClosed"
            stackId="1"
            stroke="#f97316"
            fill="url(#colorIssues)"
            name="Issues"
          />
          <Area
            type="monotone"
            dataKey="tasksDone"
            stackId="1"
            stroke="#10b981"
            fill="url(#colorTasks)"
            name="Tasks"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}


