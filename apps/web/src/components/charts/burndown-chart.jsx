// Burndown Chart - Sprint burndown
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./chart-container.jsx";

export function BurndownChart({ data = [], isLoading, isError }) {
  const isEmpty = !data || data.length === 0;

  return (
    <ChartContainer
      title="Sprint Burndown"
      subtitle="Remaining work theo ngày"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          <Line type="monotone" dataKey="remaining" stroke="#ef4444" strokeWidth={2} name="Remaining" />
          <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" name="Ideal" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}


