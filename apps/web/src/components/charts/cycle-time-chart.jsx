// Cycle Time Histogram
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./chart-container.jsx";

export function CycleTimeChart({ data = {}, isLoading, isError }) {
  const isEmpty = !data?.histogram || data.histogram.length === 0;

  return (
    <ChartContainer
      title="Cycle Time Distribution"
      subtitle={`Median: ${data?.medianDays || 0} days | P75: ${data?.p75Days || 0} days`}
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data?.histogram || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="bucket" label={{ value: "Days", position: "insideBottom", offset: -5 }} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}


