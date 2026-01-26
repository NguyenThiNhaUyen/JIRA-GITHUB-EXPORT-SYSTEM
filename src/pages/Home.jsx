
// ================= MOCK DATA =================
const mockConnections = {
  jira: false, // Đổi true/false để test UI
  github: true,
};
const mockSyncStatus = "ERROR"; // "OK" | "ERROR" | "PENDING" | "NONE"
const mockLastSync = null; // ISO string hoặc null
const mockProjects = [
  // Empty array để test onboarding
  {
    course: "SE1401",
    project: "Jira–GitHub Export Tool",
    team: "Team 1",
    jiraKey: "JIRA-123",
    repo: "fptu/jira-gh-export-tool",
    syncStatus: "ERROR",
    lastSync: "2026-01-25T14:30:00Z",
  },
];
const mockStats = [
  { label: "Courses", value: 2, icon: "M6 18L18 6M6 6l12 12", color: "blue" },
  { label: "Projects", value: 1, icon: "M4 6h16M4 12h16M4 18h16", color: "green" },
  { label: "Teams", value: 3, icon: "M17 20h5v-2a4 4 0 00-3-3.87", color: "purple" },
  { label: "Lecturers", value: 2, icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z", color: "orange" },
  { label: "Students", value: 12, icon: "M17 20h5v-2a4 4 0 00-3-3.87", color: "teal" },
  { label: "Last Sync", value: mockLastSync ? formatSyncTime(mockLastSync) : "Chưa sync", icon: "M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-4v4l3 3", color: "gray" },
];
const mockActivity = [
  { type: "sync", user: "Nguyễn Xuân Lộc", time: "2026-01-25T14:30:00Z", desc: "Đồng bộ dữ liệu thành công." },
  { type: "export", user: "NguyenThiNhaUyen", time: "2026-01-24T10:00:00Z", desc: "Xuất báo cáo nhóm Team 1." },
  { type: "connect", user: "Tran Tan Phat", time: "2026-01-23T09:00:00Z", desc: "Kết nối GitHub repo mới." },
];

function formatSyncTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
    " • " + d.toLocaleDateString("vi-VN");
}

// ================= MAIN DASHBOARD =================
export default function Home() {
  // Onboarding: thiếu project thì show stepper
  const showOnboarding = mockProjects.length === 0;
  // Banner nếu chưa kết nối Jira
  const showJiraBanner = !mockConnections.jira;
  // Repo/Commits empty nếu chưa GitHub
  const showRepoEmpty = !mockConnections.github;
  // Sync error callout
  const showSyncError = mockSyncStatus === "ERROR";

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
        {mockStats.map((s, i) => (
          <StatCard key={i} {...s} />
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
                <th className="px-3 py-2 text-left">Team</th>
                <th className="px-3 py-2 text-left">Jira Key</th>
                <th className="px-3 py-2 text-left">Repo</th>
                <th className="px-3 py-2 text-left">Sync status</th>
                <th className="px-3 py-2 text-left">Last sync</th>
              </tr>
            </thead>
            <tbody>
              {mockProjects.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6 text-gray-500">Chưa có project nào.</td></tr>
              ) : (
                mockProjects.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{p.course}</td>
                    <td className="px-3 py-2">{p.project}</td>
                    <td className="px-3 py-2">{p.team}</td>
                    <td className="px-3 py-2">{p.jiraKey}</td>
                    <td className="px-3 py-2">{showRepoEmpty ? <span className="italic text-gray-400">No repo</span> : p.repo}</td>
                    <td className="px-3 py-2">
                      <StatusPill status={p.syncStatus} />
                    </td>
                    <td className="px-3 py-2">{p.lastSync ? formatSyncTime(p.lastSync) : "Chưa sync"}</td>
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
        <ul className="space-y-3">
          {mockActivity.map((a, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <ActivityIcon type={a.type} />
              <span className="font-medium text-blue-900">{a.user}</span>
              <span className="text-gray-500">{a.desc}</span>
              <span className="ml-auto text-xs text-gray-400">{formatSyncTime(a.time)}</span>
            </li>
          ))}
        </ul>
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

function StatCard({ label, value, icon, color }) {
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
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
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
  return icons[type] || null;
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
