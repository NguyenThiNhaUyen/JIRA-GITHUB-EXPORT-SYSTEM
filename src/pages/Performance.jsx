// Performance page
import { Activity, TrendingUp, Target, Zap } from "lucide-react";
import { usePerformanceSummary, usePerformanceMembers, usePerformanceTrends } from "../hooks/use-api.js";
import { PerformanceTrendsChart } from "../components/charts/performance-trends-chart.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card.jsx";
import { mockMembers } from "../lib/mock-data.js";

function MetricCard({ title, value, icon: Icon, color }) {
  const IconComponent = Icon;
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
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
        <div className="text-3xl font-bold text-blue-900 mb-1">{value}%</div>
        <div className="text-sm text-blue-600">{title}</div>
        <div className="mt-4 w-full bg-blue-50 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              color === "blue"
                ? "bg-blue-500"
                : color === "green"
                ? "bg-green-500"
                : color === "purple"
                ? "bg-purple-500"
                : "bg-orange-500"
            }`}
            style={{ width: `${value}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Performance() {
  const { data: summary, isLoading: summaryLoading } = usePerformanceSummary();
  const { data: members, isLoading: membersLoading } = usePerformanceMembers();
  const { data: trends, isLoading: trendsLoading } = usePerformanceTrends();

  const maxScore = Math.max(...(members?.rows?.map((m) => m.score) || [0]));

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-blue-900">Performance</h1>
            <p className="text-blue-600 mt-1 text-sm">Team performance metrics và analytics</p>
          </div>
        </CardContent>
      </Card>

      {/* Team Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard
          title="Productivity"
          value={summary?.productivity || 0}
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="Efficiency"
          value={summary?.efficiency || 0}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Quality"
          value={summary?.quality || 0}
          icon={Target}
          color="purple"
        />
        <MetricCard
          title="Engagement"
          value={summary?.engagement || 0}
          icon={Zap}
          color="orange"
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Member Performance */}
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle>Member Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="space-y-6">
              {members?.rows?.map((row) => {
                const member = mockMembers.find((m) => m.id === row.memberId);
                const percentage = maxScore > 0 ? (row.score / maxScore) * 100 : 0;
                return (
                  <div key={row.memberId}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-900 text-sm lg:text-base">
                        {member?.name || "Unknown"}
                      </span>
                      <span className="text-xs lg:text-sm font-semibold text-blue-600">{row.score}%</span>
                    </div>
                    <div className="w-full bg-blue-50 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-blue-600">
                      <span>{row.commits} commits</span>
                      <span>{row.issues} issues</span>
                      <span>{row.tasks} tasks</span>
                    </div>
                  </div>
                );
              })}
              {membersLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <PerformanceTrendsChart
          data={trends?.buckets || []}
          isLoading={trendsLoading}
          isError={false}
        />
      </div>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle>Performance Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs lg:text-sm">
              <thead className="bg-blue-50 text-blue-700">
                <tr>
                  <th className="text-left font-semibold px-4 lg:px-6 py-3">Member</th>
                  <th className="text-left font-semibold px-4 lg:px-6 py-3">Score</th>
                  <th className="text-left font-semibold px-4 lg:px-6 py-3 hidden md:table-cell">Commits</th>
                  <th className="text-left font-semibold px-4 lg:px-6 py-3 hidden md:table-cell">Issues</th>
                  <th className="text-left font-semibold px-4 lg:px-6 py-3 hidden md:table-cell">Tasks</th>
                  <th className="text-left font-semibold px-4 lg:px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {members?.rows?.map((row) => {
                  const member = mockMembers.find((m) => m.id === row.memberId);
                  return (
                    <tr key={row.memberId} className="border-t border-blue-100 hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 lg:px-6 py-4 font-medium text-blue-900">{member?.name || "Unknown"}</td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {row.score}%
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-blue-600 hidden md:table-cell">{row.commits}</td>
                      <td className="px-4 lg:px-6 py-4 text-blue-600 hidden md:table-cell">{row.issues}</td>
                      <td className="px-4 lg:px-6 py-4 text-blue-600 hidden md:table-cell">{row.tasks}</td>
                      <td className="px-4 lg:px-6 py-4 font-semibold text-blue-900">{row.total}</td>
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
