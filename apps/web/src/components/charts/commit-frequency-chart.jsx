// Commit Frequency Chart - Bar chart
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./chart-container.jsx";

export function CommitFrequencyChart({ data = [], isLoading, isError }) {
  const isEmpty = !data || data.length === 0;

  return (
    <ChartContainer
      title="Project Distribution"
      subtitle="Số dự án theo lớp học"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="commits" fill="#2563eb" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}


