import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileText,
  Flame,
  GitBranch,
  Github,
  AlertTriangle,
  Users,
  Target,
  ShieldAlert,
  CheckSquare,
  Upload,
  RefreshCw,
  FolderKanban,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";

/* ----------------------------- MOCK DATA ----------------------------- */

const WEEKLY_ACTIVITY = [
  { label: "T2", commits: 3, issuesDone: 1 },
  { label: "T3", commits: 5, issuesDone: 2 },
  { label: "T4", commits: 2, issuesDone: 1 },
  { label: "T5", commits: 6, issuesDone: 3 },
  { label: "T6", commits: 4, issuesDone: 2 },
  { label: "T7", commits: 1, issuesDone: 0 },
  { label: "CN", commits: 2, issuesDone: 1 },
];

const HEATMAP_DATA = [
  1, 0, 2, 3, 1, 4, 0,
  2, 1, 0, 3, 4, 2, 1,
  0, 1, 2, 0, 4, 3, 2,
  1, 0, 1, 2, 3, 2, 1,
  4, 3, 1, 0, 2, 1, 3,
];

const COURSES = [
  {
    id: "SE113",
    code: "SE113.SP25",
    name: "Software Engineering",
    lecturer: "TS. Nguyễn Thanh Bình",
    projects: 1,
    status: "ACTIVE",
    progress: 76,
  },
  {
    id: "SWD392",
    code: "SWD392.SP25",
    name: "SWP Project",
    lecturer: "ThS. Lê Hoàng",
    projects: 1,
    status: "ACTIVE",
    progress: 68,
  },
  {
    id: "PRU211",
    code: "PRU211.SP25",
    name: "C# Programming",
    lecturer: "TS. Trần Minh Hà",
    projects: 1,
    status: "ACTIVE",
    progress: 84,
  },
];

const PROJECTS = [
  {
    id: "P1",
    courseId: "SE113",
    courseCode: "SE113.SP25",
    title: "Jira GitHub Export Tool",
    description:
      "Hệ thống theo dõi tiến độ nhóm, contribution GitHub, task Jira và export báo cáo cho lecturer/admin.",
    role: "LEADER",
    status: "ACTIVE",
    repository: "jira-gh-export-tool",
    jiraKey: "JGT",
    teamSize: 5,
    sprintCompletion: 78,
    myContribution: 82,
    commits: 24,
    issuesDone: 11,
    prsMerged: 4,
    linesChanged: 1260,
    lastCommit: "2 giờ trước",
    srsVersions: 3,
    openIssues: 5,
  },
  {
    id: "P2",
    courseId: "SWD392",
    courseCode: "SWD392.SP25",
    title: "CV Review AI Platform",
    description:
      "Nền tảng đánh giá CV cho sinh viên năm cuối và fresher, có AI feedback và scoring.",
    role: "MEMBER",
    status: "ACTIVE",
    repository: "jobie-cv-review",
    jiraKey: "JOB",
    teamSize: 4,
    sprintCompletion: 64,
    myContribution: 69,
    commits: 16,
    issuesDone: 7,
    prsMerged: 2,
    linesChanged: 845,
    lastCommit: "Hôm qua",
    srsVersions: 2,
    openIssues: 8,
  },
];

const UPCOMING_DEADLINES = [
  {
    id: "D1",
    title: "Sprint 4 Demo",
    project: "Jira GitHub Export Tool",
    due: "Ngày mai - 09:00",
    daysLeft: 1,
    severity: "high",
  },
  {
    id: "D2",
    title: "SRS Version 3",
    project: "Jira GitHub Export Tool",
    due: "Trong 2 ngày",
    daysLeft: 2,
    severity: "medium",
  },
  {
    id: "D3",
    title: "UI Progress Report",
    project: "CV Review AI Platform",
    due: "Trong 4 ngày",
    daysLeft: 4,
    severity: "low",
  },
];

const ALERTS = [
  {
    id: "A1",
    type: "warning",
    title: "Lecturer warning: contribution tuần này giảm",
    desc: "Số commit tuần này thấp hơn 35% so với tuần trước. Hãy cập nhật task Jira và đẩy tiến độ đều hơn.",
    time: "2 giờ trước",
  },
  {
    id: "A2",
    type: "info",
    title: "Sprint 4 cần hoàn thành trước demo",
    desc: "Team đang còn 5 open issues. Ưu tiên các task blocker trước deadline.",
    time: "Hôm qua",
  },
];

const PERSONAL_TASKS = [
  {
    id: "T1",
    key: "JGT-41",
    title: "Hoàn thiện dashboard Student với mock data",
    status: "In Progress",
    priority: "High",
    due: "Hôm nay",
  },
  {
    id: "T2",
    key: "JGT-38",
    title: "Kết nối API sync contribution GitHub",
    status: "Todo",
    priority: "Medium",
    due: "Ngày mai",
  },
  {
    id: "T3",
    key: "JOB-12",
    title: "Fix validation upload CV",
    status: "Done",
    priority: "Low",
    due: "Đã xong",
  },
];

const TEAM_MEMBERS = [
  { name: "Trần Thị B", commits: 24, issuesDone: 11, score: 82, role: "Leader" },
  { name: "Nguyễn Văn A", commits: 18, issuesDone: 9, score: 74, role: "Member" },
  { name: "Lê Minh C", commits: 12, issuesDone: 6, score: 61, role: "Member" },
  { name: "Phạm Khánh D", commits: 9, issuesDone: 4, score: 48, role: "Member" },
  { name: "Hoàng Gia E", commits: 7, issuesDone: 3, score: 43, role: "Member" },
];

/* ----------------------------- HELPERS ----------------------------- */

function getStatusBadgeClass(status) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "AT_RISK":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "DONE":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
}

function getSeverityClass(severity) {
  switch (severity) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

function getTaskStatusClass(status) {
  switch (status) {
    case "Done":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "In Progress":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
}

function getHeatColor(value) {
  if (value >= 4) return "bg-emerald-600";
  if (value === 3) return "bg-emerald-500";
  if (value === 2) return "bg-emerald-400";
  if (value === 1) return "bg-emerald-200";
  return "bg-slate-100";
}

function StatCard({ title, value, hint, icon: Icon, tone = "green" }) {
  const toneMap = {
    green: "from-emerald-50 to-white border-emerald-200 text-emerald-700",
    blue: "from-blue-50 to-white border-blue-200 text-blue-700",
    amber: "from-amber-50 to-white border-amber-200 text-amber-700",
    violet: "from-violet-50 to-white border-violet-200 text-violet-700",
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${toneMap[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
          <div className="mt-1 text-sm text-slate-500">{hint}</div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-100">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, actions, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-500 mt-1">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ----------------------------- COMPONENT ----------------------------- */

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState(COURSES[0]?.id || "all");

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const filteredProjects = useMemo(() => {
    if (selectedCourseId === "all") return PROJECTS;
    return PROJECTS.filter((project) => project.courseId === selectedCourseId);
  }, [selectedCourseId]);

  const totalCommits = PROJECTS.reduce((sum, item) => sum + item.commits, 0);
  const totalIssuesDone = PROJECTS.reduce((sum, item) => sum + item.issuesDone, 0);
  const totalPrsMerged = PROJECTS.reduce((sum, item) => sum + item.prsMerged, 0);
  const avgContribution = Math.round(
    PROJECTS.reduce((sum, item) => sum + item.myContribution, 0) / PROJECTS.length
  );

  const currentMainProject = filteredProjects[0] || PROJECTS[0];

  const maxCommits = Math.max(...WEEKLY_ACTIVITY.map((item) => item.commits), 1);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm font-medium text-emerald-700">
                <BookOpen className="h-4 w-4" />
                Student Dashboard
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Chào mừng, {user?.name || "Student"}!
              </h1>

              <p className="mt-2 max-w-3xl text-sm md:text-base text-slate-600">
                Theo dõi contribution GitHub, task Jira, deadline quan trọng, cảnh báo từ lecturer
                và tiến độ nhóm của bạn tại một nơi.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <div className="rounded-full bg-white px-3 py-1 border border-slate-200">
                  Vai trò: <span className="font-semibold text-slate-900">{user?.role || "STUDENT"}</span>
                </div>
                <div className="rounded-full bg-white px-3 py-1 border border-slate-200">
                  Email: <span className="font-semibold text-slate-900">{user?.email || "student@fpt.edu.vn"}</span>
                </div>
                <div className="rounded-full bg-white px-3 py-1 border border-slate-200">
                  User ID: <span className="font-semibold text-slate-900">{user?.id || "SE123456"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export báo cáo cá nhân
              </Button>
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Tổng Commits"
            value={totalCommits}
            hint="Toàn bộ project đang tham gia"
            icon={Github}
            tone="green"
          />
          <StatCard
            title="Issues hoàn thành"
            value={totalIssuesDone}
            hint="Số task Jira đã xử lý"
            icon={CheckSquare}
            tone="blue"
          />
          <StatCard
            title="PRs Merged"
            value={totalPrsMerged}
            hint="Pull request đã merge"
            icon={GitBranch}
            tone="violet"
          />
          <StatCard
            title="Contribution Score"
            value={`${avgContribution}%`}
            hint="Điểm đóng góp trung bình"
            icon={Target}
            tone="amber"
          />
        </div>

        {/* Top content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 xl:col-span-2">
            <SectionCard
              title="Khóa học của tôi"
              subtitle="Chọn khóa học để lọc project và dữ liệu phía dưới"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {COURSES.map((course) => {
                  const active = selectedCourseId === course.id;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-emerald-300 bg-emerald-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900">{course.code}</div>
                          <div className="text-sm text-slate-600 mt-1">{course.name}</div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            course.status
                          )}`}
                        >
                          {course.status}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div>Giảng viên: {course.lecturer}</div>
                        <div>Số project: {course.projects}</div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                          <span>Tiến độ môn học</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCourseId("all")}
                  className="gap-2"
                >
                  Xem tất cả khóa học
                </Button>
              </div>
            </SectionCard>

            <SectionCard
              title="Project của tôi"
              subtitle="Tổng hợp project theo course đã chọn"
              actions={
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Xem tất cả
                </Button>
              }
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-bold text-slate-900">{project.title}</div>
                        <div className="mt-1 text-sm text-slate-600">{project.description}</div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {project.role}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                        {project.courseCode}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500">Repository</div>
                        <div className="font-semibold text-blue-600">{project.repository}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Jira Project</div>
                        <div className="font-semibold text-slate-900">{project.jiraKey}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Team Size</div>
                        <div className="font-semibold text-slate-900">{project.teamSize} thành viên</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Commit cuối</div>
                        <div className="font-semibold text-slate-900">{project.lastCommit}</div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Commits</div>
                        <div className="mt-1 font-bold text-slate-900">{project.commits}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Done Issues</div>
                        <div className="mt-1 font-bold text-slate-900">{project.issuesDone}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">PR Merged</div>
                        <div className="mt-1 font-bold text-slate-900">{project.prsMerged}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Contribution</div>
                        <div className="mt-1 font-bold text-slate-900">{project.myContribution}%</div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                          <span>Sprint completion</span>
                          <span>{project.sprintCompletion}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${project.sprintCompletion}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <div>SRS Reports</div>
                        <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium">
                          {project.srsVersions} phiên bản
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button
  variant="outline"
  className="gap-2"
  onClick={() => navigate(`/student/project/${project.id}`)}
>
  <Eye className="h-4 w-4" />
  Xem chi tiết
</Button>
                      <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <RefreshCw className="h-4 w-4" />
                        Sync commits
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Upload SRS
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Phân tích hoạt động tuần này"
              subtitle="Tổng hợp commit và Jira issues đã hoàn thành trong 7 ngày gần nhất"
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Weekly bar chart */}
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <div className="font-semibold text-slate-900">Weekly Commits</div>
                  </div>

                  <div className="flex h-56 items-end justify-between gap-3">
                    {WEEKLY_ACTIVITY.map((item) => (
                      <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                        <div className="text-xs font-medium text-slate-500">{item.commits}</div>
                        <div className="flex h-44 items-end">
                          <div
                            className="w-8 rounded-t-xl bg-emerald-500"
                            style={{
                              height: `${(item.commits / maxCommits) * 170 + 10}px`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-slate-500">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Heatmap */}
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Github className="h-4 w-4 text-slate-700" />
                    <div className="font-semibold text-slate-900">Contribution Heatmap</div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {HEATMAP_DATA.map((value, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded-md ${getHeatColor(value)}`}
                        title={`Activity level: ${value}`}
                      />
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Ít hoạt động</span>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-3 w-3 rounded-sm ${getHeatColor(level)}`}
                        />
                      ))}
                    </div>
                    <span>Nhiều hoạt động</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Task cá nhân"
              subtitle="Task Jira được giao trực tiếp cho bạn"
              actions={
                <Button variant="outline" className="gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Mở Jira board
                </Button>
              }
            >
              <div className="space-y-3">
                {PERSONAL_TASKS.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {task.key}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTaskStatusClass(task.status)}`}>
                          {task.status}
                        </span>
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-2 font-semibold text-slate-900">{task.title}</div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock3 className="h-4 w-4" />
                        {task.due}
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        Xem
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <SectionCard
              title="Upcoming Deadlines"
              subtitle="Việc cần ưu tiên ngay"
            >
              <div className="space-y-3">
                {UPCOMING_DEADLINES.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 ${getSeverityClass(item.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <CalendarClock className="mt-0.5 h-5 w-5" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm opacity-90">{item.project}</div>
                        <div className="mt-2 text-sm font-medium">{item.due}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Alerts & Cảnh báo"
              subtitle="Thông báo từ hệ thống và lecturer"
            >
              <div className="space-y-3">
                {ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-2xl border p-4 ${
                      alert.type === "warning"
                        ? "border-amber-200 bg-amber-50"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {alert.type === "warning" ? (
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                      ) : (
                        <Bell className="mt-0.5 h-5 w-5 text-blue-600" />
                      )}

                      <div>
                        <div className="font-semibold text-slate-900">{alert.title}</div>
                        <div className="mt-1 text-sm text-slate-600">{alert.desc}</div>
                        <div className="mt-2 text-xs text-slate-500">{alert.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Team Progress"
              subtitle={`Tiến độ nhóm - ${currentMainProject?.title || "Project"}`}
            >
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                    <span>Sprint completion</span>
                    <span className="font-semibold text-slate-900">
                      {currentMainProject?.sprintCompletion || 0}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${currentMainProject?.sprintCompletion || 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-xs text-slate-500">Open Issues</div>
                    <div className="mt-1 text-xl font-bold text-slate-900">
                      {currentMainProject?.openIssues || 0}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-xs text-slate-500">Team Size</div>
                    <div className="mt-1 text-xl font-bold text-slate-900">
                      {currentMainProject?.teamSize || 0}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Leaderboard nhóm"
              subtitle="So sánh đóng góp trong team hiện tại"
            >
              <div className="space-y-3">
                {TEAM_MEMBERS.map((member, index) => (
                  <div
                    key={member.name}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                            #{index + 1}
                          </span>
                          <div className="font-semibold text-slate-900">{member.name}</div>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{member.role}</div>
                      </div>

                      <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {member.score}%
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-slate-500">Commits</div>
                        <div className="font-bold text-slate-900">{member.commits}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-slate-500">Done Issues</div>
                        <div className="font-bold text-slate-900">{member.issuesDone}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Quyền hạn Student"
              subtitle="Những thao tác bạn có thể thực hiện trong hệ thống"
            >
              <ul className="space-y-3 text-sm text-slate-700">
                {[
                  {
                    icon: CheckCircle2,
                    text: "Xem task cá nhân và tình trạng xử lý trên Jira",
                  },
                  {
                    icon: Github,
                    text: "Theo dõi contribution GitHub và commit activity",
                  },
                  {
                    icon: FileText,
                    text: "Upload / theo dõi phiên bản SRS của project",
                  },
                  {
                    icon: Download,
                    text: "Export báo cáo cá nhân phục vụ review và demo",
                  },
                  {
                    icon: ShieldAlert,
                    text: "Nhận cảnh báo từ lecturer khi tiến độ hoặc contribution thấp",
                  },
                  {
                    icon: Users,
                    text: "Theo dõi tiến độ chung của team và sprint completion",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.text} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-emerald-50 p-2">
                        <Icon className="h-4 w-4 text-emerald-700" />
                      </div>
                      <span>{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Gợi ý ưu tiên hôm nay
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Hoàn thiện task dashboard Student, xử lý các open issues blocker và cập nhật SRS trước deadline gần nhất.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <ArrowUpRight className="h-4 w-4" />
                Mở project chính
              </Button>
              <Button variant="outline" className="gap-2">
                <Clock3 className="h-4 w-4" />
                Xem deadlines
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}