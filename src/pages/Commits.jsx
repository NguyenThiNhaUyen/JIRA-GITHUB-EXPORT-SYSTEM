// Commits page
import { useState } from "react";
import { GitCommit, Calendar, User, Hash } from "lucide-react";
import { useCommitsList, useCommitsFrequency, useCodeChanges } from "../hooks/use-api.js";
import { CommitFrequencyChart } from "../components/charts/commit-frequency-chart.jsx";
import { CodeChangesChart } from "../components/charts/code-changes-chart.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { mockMembers } from "../lib/mock-data.js";
import { formatDateTime } from "../lib/date-utils.js";
import { useMemo } from "react";

function StatBox({ title, value, icon: Icon, color }) {
  const IconComponent = Icon;
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
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
        </div>
        <div className="text-3xl font-bold text-blue-900 mb-1">{value}</div>
        <div className="text-sm text-blue-600">{title}</div>
      </CardContent>
    </Card>
  );
}

export default function Commits() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: commitsData, isLoading: commitsLoading } = useCommitsList({ q: searchQuery });
  const { data: frequency, isLoading: frequencyLoading } = useCommitsFrequency();
  const { data: codeChanges, isLoading: codeChangesLoading } = useCodeChanges();

  const stats = useMemo(() => {
    const items = commitsData?.items || [];
    return {
      total: commitsData?.total || 0,
      today: items.filter((c) => {
        const commitDate = new Date(c.committedAt).toDateString();
        return commitDate === new Date().toDateString();
      }).length,
      thisWeek: items.length,
    };
  }, [commitsData]);

  const commits = commitsData?.items || [];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-blue-900">Commits</h1>
              <p className="text-blue-600 mt-1 text-sm">Lịch sử commit từ GitHub</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("today")}
              >
                Today
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox title="Total Commits" value={stats.total} icon={GitCommit} color="blue" />
        <StatBox title="Today" value={stats.today} icon={Calendar} color="green" />
        <StatBox title="This Week" value={stats.thisWeek} icon={Hash} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CommitFrequencyChart
          data={frequency?.buckets || []}
          isLoading={frequencyLoading}
          isError={false}
        />
        <CodeChangesChart
          data={codeChanges?.buckets || []}
          isLoading={codeChangesLoading}
          isError={false}
        />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search by commit message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Commit List */}
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle>Commit History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-blue-100">
            {commits.slice(0, 20).map((commit) => {
              const author = mockMembers.find((m) => m.id === commit.authorId);
              return (
                <CommitItem key={commit.id} commit={commit} author={author} />
              );
            })}
            {commits.length === 0 && !commitsLoading && (
              <div className="p-10 text-center text-blue-500">Không có commits</div>
            )}
            {commitsLoading && (
              <div className="p-10 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CommitItem({ commit, author }) {
  return (
    <div className="p-4 lg:p-6 hover:bg-blue-50/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            {author?.name.charAt(0) || "U"}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Hash size={14} className="text-blue-400 flex-shrink-0" />
            <code className="text-xs lg:text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded flex-shrink-0">
              {commit.sha.slice(0, 7)}
            </code>
            <span className="font-medium text-blue-900 text-sm lg:text-base break-words">{commit.message}</span>
          </div>
          <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm text-blue-600 flex-wrap">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{author?.name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDateTime(commit.committedAt)}</span>
            </div>
            <span className="text-green-600">+{commit.additions}</span>
            <span className="text-red-600">-{commit.deletions}</span>
            <span className="text-blue-500">{commit.filesChanged} files</span>
          </div>
        </div>
      </div>
    </div>
  );
}
