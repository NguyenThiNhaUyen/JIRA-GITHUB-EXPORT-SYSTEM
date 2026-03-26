// Burndown Chart - Sprint burndown
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./chart-container.jsx";

export function BurndownChart({ data = [], isLoading, isError }) {
  const isEmpty = !data || data.length === 0;

  return (
    <ChartContainer
      title="Course Progress"
      subtitle="Remaining enrollment slots theo môn học"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          <Legend verticalAlign="top" height={24} />
          <Line type="monotone" dataKey="remaining" stroke="#ef4444" strokeWidth={2} name="Remaining" />
          <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" name="Ideal" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}


