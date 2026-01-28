// Dashboard: Trang tổng quan với charts đầy đủ
import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { GitBranch, AlertCircle, CheckCircle, Users } from "lucide-react";
import { WeeklyTrendsChart } from "../components/charts/weekly-trends-chart.jsx";
import { BurndownChart } from "../components/charts/burndown-chart.jsx";
import { HeatmapChart } from "../components/charts/heatmap-chart.jsx";
import { ContributorsChart } from "../components/charts/contributors-chart.jsx";
import { useDashboardSummary, useDashboardTrends, useHeatmap } from "../hooks/use-api.js";
import { mockMembers } from "../lib/mock-data.js";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card.jsx";

function StatCard({ icon: Icon, title, value, change, color }) {
  const IconComponent = Icon;
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <IconComponent size={24} />
          </div>
          <span className="text-sm font-medium text-green-600">{change}</span>
        </div>
        <div className="text-3xl font-bold text-blue-900 mb-1">{value}</div>
        <div className="text-sm text-blue-600">{title}</div>
      </CardContent>
    </Card>
  );
}

function Th({ children, onClick }) {
  return (
    <th
      onClick={onClick}
      className={`text-left font-semibold px-4 lg:px-6 py-3 select-none text-xs lg:text-sm ${
        onClick ? "cursor-pointer hover:text-blue-900" : ""
      }`}
    >
      {children}
    </th>
  );
}

export default function Dashboard() {
  const { weeks, weekId } = useApp();
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("commits");
  const [sortDir, setSortDir] = useState("desc");
  const [memberFilter, setMemberFilter] = useState(null);

  const currentWeek = weeks.find((w) => w.id === weekId);
  const weekLabel = currentWeek?.label || "N/A";

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: trends, isLoading: trendsLoading } = useDashboardTrends();
  const { data: heatmap, isLoading: heatmapLoading } = useHeatmap(memberFilter);

  // Calculate contributors from trends
  const contributors = useMemo(() => {
    if (!trends?.buckets) return [];
    const memberStats = mockMembers.map((member) => ({
      name: member.name.split(" ").pop(),
      value: Math.floor(Math.random() * 50) + 10, // Mock calculation
    }));
    return memberStats.sort((a, b) => b.value - a.value).slice(0, 5);
  }, [trends]);

  // Mock burndown data
  const burndownData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + i);
      return {
        date: date.toISOString().slice(0, 10),
        remaining: 40 - i * 5,
        ideal: 40 - (40 / 6) * i,
      };
    });
  }, []);

  function toggleSort(nextKey) {
    if (sortKey !== nextKey) {
      setSortKey(nextKey);
      setSortDir("desc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-blue-900">Dashboard Overview</h1>
              <p className="text-blue-600 mt-1 text-sm lg:text-base">{weekLabel}</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                className="flex-1 md:w-64 rounded-xl border border-blue-200 px-4 py-2 text-sm bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Tìm kiếm..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          icon={GitBranch}
          title="Commits"
          value={summary?.totalCommits || 0}
          change="+12%"
          color="blue"
        />
        <StatCard
          icon={AlertCircle}
          title="Issues"
          value={summary?.totalIssues || 0}
          change="+5%"
          color="orange"
        />
        <StatCard
          icon={CheckCircle}
          title="Tasks"
          value={summary?.tasksCompleted || 0}
          change="+18%"
          color="green"
        />
        <StatCard
          icon={Users}
          title="Members"
          value={summary?.activeMembers || 0}
          change="100%"
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyTrendsChart
          data={trends?.buckets || []}
          isLoading={trendsLoading}
          isError={false}
        />
        <BurndownChart data={burndownData} isLoading={false} isError={false} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HeatmapChart
          data={heatmap?.days || []}
          isLoading={heatmapLoading}
          isError={false}
        />
        <ContributorsChart
          data={contributors}
          isLoading={false}
          isError={false}
        />
      </div>

      {/* Team Performance Table - Mobile optimized */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle>Team Performance</CardTitle>
            <div className="text-xs lg:text-sm text-blue-600">
              Sort: <span className="font-medium">{sortKey}</span> ({sortDir})
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs lg:text-sm">
              <thead className="bg-blue-50 text-blue-700">
                <tr>
                  <Th onClick={() => toggleSort("student")}>
                    Student {sortKey === "student" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </Th>
                  <Th className="hidden md:table-cell">Email</Th>
                  <Th onClick={() => toggleSort("commits")}>
                    Commits {sortKey === "commits" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </Th>
                  <Th onClick={() => toggleSort("issues")}>
                    Issues {sortKey === "issues" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </Th>
                  <Th>Total</Th>
                </tr>
              </thead>
              <tbody>
                {mockMembers.map((member, idx) => {
                  const commits = Math.floor(Math.random() * 20) + 5;
                  const issues = Math.floor(Math.random() * 10) + 2;
                  const total = commits + issues;
                  return (
                    <tr key={member.id} className="border-t border-blue-100 hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 lg:px-6 py-3 font-medium text-blue-900">{member.name}</td>
                      <td className="px-4 lg:px-6 py-3 text-blue-600 hidden md:table-cell">{member.email}</td>
                      <td className="px-4 lg:px-6 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {commits}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          {issues}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 font-semibold text-blue-900">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
