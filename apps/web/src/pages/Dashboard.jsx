import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "../context/AppContext.jsx";
import { GitBranch, AlertCircle, CheckCircle, Users } from "lucide-react";
import { WeeklyTrendsChart } from "../components/charts/weekly-trends-chart.jsx";
import { HeatmapChart } from "../components/charts/heatmap-chart.jsx";
import { useDashboardSummary, useDashboardTrends, useHeatmap } from "../hooks/use-api.js";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card.jsx";
import { getTeamRankings } from "../features/dashboard/api/analyticsApi.js";

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

  const currentWeek = weeks.find((w) => w.id === weekId);
  const weekLabel = currentWeek?.label || "N/A";

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: trends, isLoading: trendsLoading } = useDashboardTrends();
  const { data: heatmap, isLoading: heatmapLoading } = useHeatmap(null);

  const { data: teamRankings, isLoading: rankingsLoading } = useQuery({
    queryKey: ['dashboard', 'teamRankings'],
    queryFn: () => getTeamRankings(5)
  });

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
          value={summaryLoading ? "..." : summary?.totalCommits || 0}
          change="+12%"
          color="blue"
        />
        <StatCard
          icon={AlertCircle}
          title="Issues"
          value={summaryLoading ? "..." : summary?.totalIssues || 0}
          change="+5%"
          color="orange"
        />
        <StatCard
          icon={CheckCircle}
          title="Tasks"
          value={summaryLoading ? "..." : summary?.tasksCompleted || 0}
          change="+18%"
          color="green"
        />
        <StatCard
          icon={Users}
          title="Members"
          value={summaryLoading ? "..." : summary?.activeMembers || 0}
          change=""
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
        <HeatmapChart
          data={heatmap?.days || []}
          isLoading={heatmapLoading}
          isError={false}
        />
      </div>

      {/* Top Teams Table */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle>Top Teams by Commits</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs lg:text-sm">
              <thead className="bg-blue-50 text-blue-700">
                <tr>
                  <Th>Team Name</Th>
                  <Th className="hidden md:table-cell">Project</Th>
                  <Th>Commits</Th>
                </tr>
              </thead>
              <tbody>
                {rankingsLoading ? (
                  <tr><td colSpan={3} className="text-center py-4 text-blue-600">Loading rankings...</td></tr>
                ) : !teamRankings || teamRankings.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-4 text-gray-500">No data available.</td></tr>
                ) : (
                  teamRankings.map((team, idx) => (
                    <tr key={team.teamId || idx} className="border-t border-blue-100 hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 lg:px-6 py-3 font-medium text-blue-900">{team.teamName || 'Unknown Team'}</td>
                      <td className="px-4 lg:px-6 py-3 text-blue-600 hidden md:table-cell">{team.projectName || 'Unknown Project'}</td>
                      <td className="px-4 lg:px-6 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {team.totalCommits || 0}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
