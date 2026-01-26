// Contribution Heatmap - GitHub-like
import { ChartContainer } from "./chart-container.jsx";
import dayjs from "dayjs";

export function HeatmapChart({ data = [], isLoading, isError, onDayClick }) {
  const isEmpty = !data || data.length === 0;

  // Group by week
  const weeks = [];
  let currentWeek = [];
  data.forEach((day, idx) => {
    const date = dayjs(day.date);
    if (idx === 0 || date.day() === 1) {
      if (currentWeek.length > 0) weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const getIntensity = (count) => {
    if (count === 0) return "bg-blue-50";
    if (count <= 3) return "bg-blue-200";
    if (count <= 6) return "bg-blue-400";
    if (count <= 9) return "bg-blue-600";
    return "bg-blue-800";
  };

  return (
    <ChartContainer
      title="Contribution Heatmap"
      subtitle="Activity theo ngày"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
    >
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`w-3 h-3 rounded ${getIntensity(day.count)} cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all`}
                  title={`${day.date}: ${day.count} contributions`}
                  onClick={() => onDayClick?.(day)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 text-xs text-blue-600">
        <span>Ít hơn</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-blue-50" />
          <div className="w-3 h-3 rounded bg-blue-200" />
          <div className="w-3 h-3 rounded bg-blue-400" />
          <div className="w-3 h-3 rounded bg-blue-600" />
          <div className="w-3 h-3 rounded bg-blue-800" />
        </div>
        <span>Nhiều hơn</span>
      </div>
    </ChartContainer>
  );
}


