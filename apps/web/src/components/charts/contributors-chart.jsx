// Top Contributors Chart - Horizontal Bar
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "./chart-container.jsx";

export function ContributorsChart({ data = [], isLoading, isError, limit = 5 }) {
  const isEmpty = !data || data.length === 0;
  const displayData = data.slice(0, limit);

  return (
    <ChartContainer
      title="Top Contributors"
      subtitle={`Top ${limit} contributors`}
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={displayData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12 }}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}


