import { useQuery } from "@tanstack/react-query";
import { getAnalyticsStats, getActivityLog } from "../features/dashboard/api/analyticsApi.js";
import { projectService } from "../services/projectService.js";

// ================= UTILS =================
function formatSyncTime(iso) {
  if (!iso) return "Chưa sync";
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
    " • " + d.toLocaleDateString("vi-VN");
}

// ================= MAIN DASHBOARD =================
export default function Home() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['home', 'stats'],
    queryFn: getAnalyticsStats
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['home', 'projects'],
    queryFn: () => projectService.getProjects()
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['home', 'activity'],
    queryFn: () => getActivityLog(3)
  });

  const projects = projectsData || [];
  const activities = activityData?.items || []; // adjust if API returns array directly

  const showOnboarding = projects.length === 0 && !projectsLoading;
  
  // Note: These mock states can be tied to real config later
  const mockConnections = { jira: true, github: true };
  const showJiraBanner = false;
  const showRepoEmpty = false;
  const showSyncError = false;

  const stats = [
    { label: "Courses", value: statsData?.totalCourses || 0, icon: "M6 18L18 6M6 6l12 12", color: "blue" },
    { label: "Projects", value: statsData?.totalProjects || 0, icon: "M4 6h16M4 12h16M4 18h16", color: "green" },
    { label: "Teams", value: statsData?.activeGroups || 0, icon: "M17 20h5v-2a4 4 0 00-3-3.87", color: "purple" },
    { label: "Students", value: statsData?.totalUsers || 0, icon: "M17 20h5v-2a4 4 0 00-3-3.87", color: "teal" },
    { label: "Success Rate", value: (statsData?.syncSuccessRate || 0) + "%", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z", color: "orange" },
    { label: "Commits", value: statsData?.totalCommits || 0, icon: "M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-4v4l3 3", color: "gray" },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Connection chips */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
        <ConnectionChip label="Jira" connected={mockConnections.jira} />
        <ConnectionChip label="GitHub" connected={mockConnections.github} />
      </div>

      {/* Jira warning banner */}
      {showJiraBanner && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#b45309" strokeWidth="2" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Chưa kết nối Jira. Vui lòng kết nối để sử dụng đầy đủ chức năng.</span>
        </div>
      )}

      {/* Onboarding checklist */}
      {showOnboarding && <OnboardingStepper />}

      {/* Sync error callout */}
      {showSyncError && (
        <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#dc2626" strokeWidth="2" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Đồng bộ dữ liệu thất bại. <button className="ml-2 px-3 py-1 rounded-lg bg-white border border-red-300 text-red-700 hover:bg-red-100 text-sm">View Sync Logs</button></span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} loading={statsLoading} />
        ))}
      </div>

      {/* Projects table */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-blue-900">Projects</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-blue-300" disabled={showJiraBanner}>Sync Now</button>
            <button className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:bg-slate-400" disabled={showJiraBanner}>Export Report</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-3 py-2 text-left">Course</th>
                <th className="px-3 py-2 text-left">Project</th>
                <th className="px-3 py-2 text-left">Team Name</th>
                <th className="px-3 py-2 text-left">Jira Key</th>
                <th className="px-3 py-2 text-left">Repo</th>
                <th className="px-3 py-2 text-left">Sync status</th>
                <th className="px-3 py-2 text-left">Last sync</th>
              </tr>
            </thead>
            <tbody>
              {projectsLoading ? (
                <tr><td colSpan={7} className="text-center py-6 text-gray-500">Đang tải...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-gray-500">Chưa có project nào.</td></tr>
              ) : (
                projects.map((p, i) => (
                  <tr key={p.id || i} className="border-t">
                    <td className="px-3 py-2">{p.course?.code || "N/A"}</td>
                    <td className="px-3 py-2">{p.name || "N/A"}</td>
                    <td className="px-3 py-2">{p.team?.name || "N/A"}</td>
                    <td className="px-3 py-2">{p.integration?.jiraKey || "N/A"}</td>
                    <td className="px-3 py-2">{p.integration?.githubRepo || "N/A"}</td>
                    <td className="px-3 py-2">
                      <StatusPill status={p.integration?.syncStatus || "NONE"} />
                    </td>
                    <td className="px-3 py-2">{formatSyncTime(p.integration?.lastSyncAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent activity feed */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-bold text-blue-900 mb-4">Recent Activity</h2>
        {activityLoading ? (
          <p className="text-sm text-gray-500">Đang tải hoạt động...</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-500">Không có hoạt động gần đây.</p>
        ) : (
          <ul className="space-y-3">
            {activities.map((a, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <ActivityIcon type={a.action || "sync"} />
                <span className="font-medium text-blue-900">{a.user || "System"}</span>
                <span className="text-gray-500">{a.description || a.message}</span>
                <span className="ml-auto text-xs text-gray-400">{formatSyncTime(a.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ========== COMPONENTS ========== //
function ConnectionChip({ label, connected }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${connected ? "bg-green-50 border-green-300 text-green-700" : "bg-gray-100 border-gray-300 text-gray-500"}`}>
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" fill={connected ? "#22c55e" : "#d1d5db"} /></svg>
      {label}
    </span>
  );
}

function StatCard({ label, value, icon, color, loading }) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
    teal: "text-teal-600 bg-teal-100",
    gray: "text-gray-600 bg-gray-100",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col items-start">
      <div className={`rounded-lg p-2 mb-2 ${colorMap[color]}`}> <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d={icon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> </div>
      <div className="text-2xl font-bold">{loading ? "..." : value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    SUCCESS: ["bg-green-100 text-green-700", "Đã sync"],
    OK: ["bg-green-100 text-green-700", "Đã sync"],
    ERROR: ["bg-red-100 text-red-700", "Lỗi"],
    PENDING: ["bg-yellow-100 text-yellow-700", "Đang sync"],
    NONE: ["bg-gray-100 text-gray-500", "Chưa sync"],
  };
  const [cls, text] = map[status] || map.NONE;
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{text}</span>;
}

function ActivityIcon({ type }) {
  const icons = {
    sync: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M4 4v5h.582M20 20v-5h-.581M19.418 9A7.974 7.974 0 0012 4a8 8 0 00-7.418 5M4.582 15A7.974 7.974 0 0012 20a8 8 0 007.418-5"/></svg>,
    export: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#0ea5e9" strokeWidth="2" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"/></svg>,
    connect: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/><path stroke="#22c55e" strokeWidth="2" d="M8 12l2 2 4-4"/></svg>,
  };
  return icons[type] || icons.sync;
}

function OnboardingStepper() {
  const steps = [
    "Tạo Course",
    "Tạo Project",
    "Liên kết Jira Project",
    "Liên kết GitHub Repo",
    "Đồng bộ dữ liệu",
  ];
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
      <h2 className="font-bold text-blue-900 mb-2">Bắt đầu sử dụng</h2>
      <ol className="list-decimal ml-6 space-y-1 text-blue-800">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}

