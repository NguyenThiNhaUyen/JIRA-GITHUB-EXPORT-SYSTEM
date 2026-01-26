// Code Changes Chart - Line chart additions/deletions
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./chart-container.jsx";

export function CodeChangesChart({ data = [], isLoading, isError }) {
  const isEmpty = !data || data.length === 0;

  return (
    <ChartContainer
      title="Code Changes"
      subtitle="Additions và deletions theo ngày"
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
          <Line type="monotone" dataKey="additions" stroke="#10b981" strokeWidth={2} name="Additions" />
          <Line type="monotone" dataKey="deletions" stroke="#ef4444" strokeWidth={2} name="Deletions" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}


