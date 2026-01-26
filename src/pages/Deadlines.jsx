// Deadlines page - Calendar + Roadmap
import { useState } from "react";
import { Calendar, Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useDeadlinesRoadmap, useDeadlinesDistribution } from "../hooks/use-api.js";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card.jsx";
import { useApp } from "../context/AppContext.jsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer } from "../components/charts/chart-container.jsx";
import dayjs from "dayjs";

function StatBox({ title, value, icon: Icon, color }) {
  const IconComponent = Icon;
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <IconComponent size={24} />
          </div>
        </div>
        <div className="text-3xl font-bold text-blue-900 mb-1">{value}</div>
        <div className="text-sm text-blue-600">{title}</div>
      </CardContent>
    </Card>
  );
}

export default function Deadlines() {
  const { weeks, weekId } = useApp();
  const [view, setView] = useState("week");

  const { data: roadmap, isLoading: roadmapLoading } = useDeadlinesRoadmap();
  const { data: distribution, isLoading: distLoading } = useDeadlinesDistribution();

  const currentWeek = weeks.find((w) => w.id === weekId);
  const milestones = roadmap?.items || [];
  const sprints = roadmap?.sprints || [];

  const upcomingDeadlines = milestones.filter((d) => d.status === "upcoming" || d.status === "overdue");
  const completedDeadlines = milestones.filter((d) => d.status === "completed");

  // Generate calendar days
  const getDaysInWeek = () => {
    if (!currentWeek) return [];
    const days = [];
    const start = dayjs(currentWeek.fromISO || currentWeek.from);
    for (let i = 0; i < 7; i++) {
      days.push(start.add(i, "day"));
    }
    return days;
  };

  const getDeadlinesForDate = (date) => {
    const dateStr = date.format("YYYY-MM-DD");
    return milestones.filter((m) => dayjs(m.dueAt).format("YYYY-MM-DD") === dateStr);
  };

  const days = getDaysInWeek();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-blue-900">Deadlines</h1>
              <p className="text-blue-600 mt-1 text-sm">Quản lý deadlines và milestones</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("week")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  view === "week"
                    ? "bg-blue-500 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView("month")}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  view === "month"
                    ? "bg-blue-500 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox title="Upcoming" value={upcomingDeadlines.length} icon={Clock} color="orange" />
        <StatBox title="Completed" value={completedDeadlines.length} icon={CheckCircle} color="green" />
        <StatBox title="This Week" value={upcomingDeadlines.length} icon={Calendar} color="blue" />
      </div>

      {/* Calendar Week View */}
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <CardTitle>{currentWeek?.label || "Week View"}</CardTitle>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-blue-50 rounded-lg">
                <ChevronLeft size={18} className="text-blue-600" />
              </button>
              <button className="p-2 hover:bg-blue-50 rounded-lg">
                <ChevronRight size={18} className="text-blue-600" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center text-xs lg:text-sm font-semibold text-blue-700 py-2">
                {day}
              </div>
            ))}
            {days.map((date, idx) => {
              const dateDeadlines = getDeadlinesForDate(date);
              const isToday = date.isSame(dayjs(), "day");
              return (
                <div
                  key={idx}
                  className={`min-h-20 lg:min-h-24 p-2 border rounded-lg text-xs ${
                    isToday
                      ? "bg-blue-100 border-blue-300"
                      : "bg-blue-50/50 border-blue-100"
                  }`}
                >
                  <div className={`font-medium mb-2 ${isToday ? "text-blue-900" : "text-blue-600"}`}>
                    {date.date()}
                  </div>
                  <div className="space-y-1">
                    {dateDeadlines.slice(0, 2).map((deadline) => (
                      <div
                        key={deadline.id}
                        className={`text-xs p-1 rounded truncate ${
                          deadline.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : deadline.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {deadline.title}
                      </div>
                    ))}
                    {dateDeadlines.length > 2 && (
                      <div className="text-xs text-blue-600">+{dateDeadlines.length - 2}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Chart */}
      <ChartContainer
        title="Upcoming Deadlines Distribution"
        subtitle="Số lượng deadlines theo tuần"
        isLoading={distLoading}
        isError={false}
        isEmpty={!distribution?.buckets || distribution.buckets.length === 0}
      >
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={distribution?.buckets || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* All Deadlines List */}
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle>All Deadlines</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-blue-100">
            {milestones.map((deadline) => (
              <DeadlineItem key={deadline.id} deadline={deadline} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DeadlineItem({ deadline }) {
  const statusColors = {
    upcoming: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 lg:p-6 hover:bg-blue-50/30 transition-colors">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Calendar size={20} className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 text-sm lg:text-base">{deadline.title}</h4>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs lg:text-sm text-blue-600">
                {dayjs(deadline.dueAt).format("DD/MM/YYYY")}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[deadline.status]}`}>
                {deadline.status}
              </span>
            </div>
          </div>
        </div>
        {deadline.status === "overdue" && (
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
        )}
        {deadline.status === "completed" && (
          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
