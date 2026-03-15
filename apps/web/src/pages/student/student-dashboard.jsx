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
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

import {
  useStudentStats,
  useAnalyticsHeatmap,
  useStudentCommitActivity,
  useStudentDeadlines,
} from "../../features/dashboard/hooks/useDashboard.js";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects } from "../../features/projects/hooks/useProjects.js";

/* ----------------------------- MOCKED / FALLBACK DATA DELETED ----------------------------- */

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

function StatCard({ title, value, hint, icon: Icon, tone = "green", onClick }) {
  const toneMap = {
    green: "from-emerald-50 to-white border-emerald-200 text-emerald-700",
    blue: "from-blue-50 to-white border-blue-200 text-blue-700",
    amber: "from-amber-50 to-white border-amber-200 text-amber-700",
    violet: "from-violet-50 to-white border-violet-200 text-violet-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border bg-gradient-to-br p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneMap[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-500">{title}</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
          <div className="mt-1 text-sm text-slate-500">{hint}</div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </button>
  );
}

function SectionCard({ title, subtitle, actions, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ----------------------------- COMPONENT ----------------------------- */

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState("all");

  // Fetch real data
  const { data: stats, isLoading: statsLoading } = useStudentStats();
  const { data: heatmap, isLoading: heatmapLoading } = useAnalyticsHeatmap();
  const { data: commitActivity, isLoading: activityLoading } = useStudentCommitActivity(7);
  const { data: deadlinesData } = useStudentDeadlines();
  const { data: courseData, isLoading: coursesLoading } = useGetCourses();
  const { data: projectData, isLoading: projectsLoading } = useGetProjects();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const courses = courseData?.items || [];
  const projects = projectData?.items || [];
  const upcomingDeadlines = deadlinesData?.items || deadlinesData || [];

  const filteredProjects = useMemo(() => {
    if (selectedCourseId === "all") return projects;
    return projects.filter((project) => String(project.courseId) === String(selectedCourseId));
  }, [selectedCourseId, projects]);

  const weeklyActivity = commitActivity || [];
  const heatmapData = heatmap || [];

  const currentMainProject = filteredProjects[0] || projects[0];

  const studentKPI = {
    totalCommits: stats?.weeklyCommits || projects.reduce((sum, item) => sum + (item.commits || 0), 0),
    totalIssues: stats?.totalIssues || projects.reduce((sum, item) => sum + (item.issuesDone || 0), 0),
    totalPrs: stats?.totalPrs || projects.reduce((sum, item) => sum + (item.prsMerged || 0), 0),
    avgContrib: stats?.contributionPercent || (projects.length > 0
      ? Math.round(projects.reduce((sum, item) => sum + (item.myContribution || 0), 0) / projects.length)
      : 0)
  };

  const maxCommits = Math.max(...weeklyActivity.map((item) => item.commits ?? item.count ?? 0), 1);


  if (statsLoading || coursesLoading || projectsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-500 font-medium">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSyncProject = (project) => {
    success?.(`Đã đồng bộ mock commits cho project ${project.title}`);
  };

  const handleUploadSrs = (project) => {
    success?.(`Mở mock upload SRS cho project ${project.title}`);
  };

  const handleExport = () => {
    success?.("Đã export mock báo cáo cá nhân thành công");
  };

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

              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Chào mừng, {user?.name || "Student"}!
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
                Theo dõi contribution GitHub, task Jira, deadline quan trọng, cảnh báo từ lecturer
                và tiến độ nhóm của bạn tại một nơi.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  Vai trò: <span className="font-semibold text-slate-900">{user?.role || "STUDENT"}</span>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  Email: <span className="font-semibold text-slate-900">{user?.email || "student@fpt.edu.vn"}</span>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  User ID: <span className="font-semibold text-slate-900">{user?.id || "SE123456"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2" onClick={handleExport}>
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
            value={studentKPI.totalCommits}
            hint="Xem trang contribution"
            icon={Github}
            tone="green"
            onClick={() => navigate("/student/contribution")}
          />
          <StatCard
            title="Issues hoàn thành"
            value={studentKPI.totalIssues}
            hint="Xem project của tôi"
            icon={CheckSquare}
            tone="blue"
            onClick={() => navigate("/student/my-project")}
          />
          <StatCard
            title="PRs Merged"
            value={studentKPI.totalPrs}
            hint="Xem chi tiết project"
            icon={GitBranch}
            tone="violet"
            onClick={() => navigate(`/student/project/${currentMainProject?.id || "P1"}`)}
          />
          <StatCard
            title="Contribution Score"
            value={`${studentKPI.avgContrib}%`}
            hint="Phân tích đóng góp cá nhân"
            icon={Target}
            tone="amber"
            onClick={() => navigate("/student/contribution")}
          />
        </div>

        {/* Quick navigation */}
        <SectionCard
          title="Truy cập nhanh"
          subtitle="Đi đến các trang student đã hoàn thiện"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[
              {
                label: "Lớp của tôi",
                icon: BookOpen,
                path: "/student/courses",
                desc: "Danh sách lớp học",
              },
              {
                label: "Nhóm của tôi",
                icon: FolderKanban,
                path: "/student/my-project",
                desc: "Project đang tham gia",
              },
              {
                label: "Contribution",
                icon: BarChart3,
                path: "/student/contribution",
                desc: "Đóng góp cá nhân",
              },
              {
                label: "Cảnh báo",
                icon: Bell,
                path: "/student/alerts",
                desc: "Nhắc nhở từ hệ thống",
              },
              {
                label: "SRS Reports",
                icon: FileText,
                path: "/student/srs",
                desc: "Tài liệu và nhận xét",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <ExternalLink className="mt-1 h-4 w-4 text-slate-400" />
                  </div>
                  <div className="mt-4 font-semibold text-slate-900">{item.label}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.desc}</div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Top content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 xl:col-span-2">
            <SectionCard
              title="Khóa học của tôi"
              subtitle="Chọn khóa học để lọc project và dữ liệu phía dưới"
              actions={
                <Button variant="outline" className="gap-2" onClick={() => navigate("/student/courses")}>
                  <BookOpen className="h-4 w-4" />
                  Xem tất cả lớp
                </Button>
              }
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {courses.map((course) => {
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
                          <div className="mt-1 text-sm text-slate-600">{course.name}</div>
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
                        <div>Giảng viên: {course.lecturer?.name || "N/A"}</div>
                        <div>Số sinh viên: {course.currentStudents || 0}</div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                          <span>Dung lượng lớp</span>
                          <span>{course.currentStudents}/{course.maxStudents}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${(course.currentStudents / course.maxStudents) * 100}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <Button variant="outline" onClick={() => setSelectedCourseId("all")} className="gap-2">
                  Xem tất cả khóa học
                </Button>
              </div>
            </SectionCard>

            <SectionCard
              title="Project của tôi"
              subtitle="Tổng hợp project theo course đã chọn"
              actions={
                <Button variant="outline" className="gap-2" onClick={() => navigate("/student/my-project")}>
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
                      <Button
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleSyncProject(project)}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Sync commits
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleUploadSrs(project)}
                      >
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
              actions={
                <Button variant="outline" className="gap-2" onClick={() => navigate("/student/contribution")}>
                  <BarChart3 className="h-4 w-4" />
                  Xem trang contribution
                </Button>
              }
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <div className="font-semibold text-slate-900">Weekly Commits</div>
                  </div>

                  <div className="flex h-56 items-end justify-between gap-3">
                    {weeklyActivity.map((item, idx) => {
                      const commitCount = item.commits ?? item.count ?? 0;
                      const dayLabel = item.label ?? item.day ?? `D${idx + 1}`;
                      return (
                        <div key={dayLabel} className="flex flex-1 flex-col items-center gap-2">
                          <div className="text-xs font-medium text-slate-500">{commitCount}</div>
                          <div className="flex h-44 items-end">
                            <div
                              className="w-8 rounded-t-xl bg-emerald-500"
                              style={{
                                height: `${(commitCount / maxCommits) * 170 + 10}px`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-slate-500">{dayLabel}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Github className="h-4 w-4 text-slate-700" />
                    <div className="font-semibold text-slate-900">Contribution Heatmap</div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {heatmapData.map((item, index) => {
                      const count = typeof item === 'object' ? (item.count ?? item.value ?? 0) : item;
                      return (
                        <div
                          key={item.date || index}
                          className={`aspect-square rounded-md ${getHeatColor(count)}`}
                          title={item.date ? `${item.date}: ${count} commits` : `Activity: ${count}`}
                        />
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Ít hoạt động</span>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((level) => (
                        <div key={level} className={`h-3 w-3 rounded-sm ${getHeatColor(level)}`} />
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
                <Button variant="outline" className="gap-2" onClick={() => navigate("/student/my-project")}>
                  <FolderKanban className="h-4 w-4" />
                  Mở trang project
                </Button>
              }
            >
              <div className="space-y-3">
                {filteredProjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                    Chưa có task nào được gữ — Hãy kiểm tra Jira.
                  </div>
                ) : (
                  filteredProjects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                            {project.courseCode || project.courseName || "Task"}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="mt-2 font-semibold text-slate-900">{project.title || project.name}</div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock3 className="h-4 w-4" />
                          {project.lastCommit || "Chưa có commit"}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => navigate("/student/my-project")}
                        >
                          Xem
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <SectionCard
              title="Upcoming Deadlines"
              subtitle="Việc cần ưu tiên ngay"
              actions={
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/student/srs")}>
                  <CalendarClock className="h-4 w-4" />
                  Xem SRS
                </Button>
              }
            >
              <div className="space-y-3">
                {upcomingDeadlines.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                    Không có deadline sắp tới ✔️
                  </div>
                ) : (
                  upcomingDeadlines.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => navigate("/student/srs")}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:shadow-sm ${getSeverityClass(
                      item.severity || (item.daysLeft <= 1 ? "high" : item.daysLeft <= 3 ? "medium" : "low")
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <CalendarClock className="mt-0.5 h-5 w-5" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm opacity-90">{item.project || item.projectName}</div>
                        <div className="mt-2 text-sm font-medium">{item.due || item.dueDate}</div>
                      </div>
                    </div>
                  </button>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Alerts & Cảnh báo"
              subtitle="Thông báo từ hệ thống và lecturer"
              actions={
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/student/alerts")}>
                  <Bell className="h-4 w-4" />
                  Xem tất cả
                </Button>
              }
            >
              <div className="space-y-3">
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  <Bell className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                  Các cảnh báo sẽ hiện thị ở đây khi giảng viên gửi thông báo.
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Team Progress"
              subtitle={`Tiến độ nhóm - ${currentMainProject?.title || "Project"}`}
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate(`/student/project/${currentMainProject?.id || "P1"}`)}
                >
                  <Eye className="h-4 w-4" />
                  Mở project
                </Button>
              }
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
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate(`/student/project/${currentMainProject?.id || "P1"}`)}
                >
                  <Users className="h-4 w-4" />
                  Xem team
                </Button>
              }
            >
              <div className="space-y-3">
                {(currentMainProject?.team || []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                    Chưa có dữ liệu thành viên nhóm.
                  </div>
                ) : (
                  (currentMainProject?.team || []).map((member, index) => (
                    <div
                      key={member.studentId || index}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                              #{index + 1}
                            </span>
                            <div className="font-semibold text-slate-900">{member.studentName || member.name}</div>
                          </div>
                          <div className="mt-1 text-xs text-slate-500">{member.role}</div>
                        </div>

                        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                          {member.contributionScore ?? "--"}%
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="text-slate-500">Commits</div>
                          <div className="font-bold text-slate-900">{member.commits ?? "--"}</div>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="text-slate-500">Done Issues</div>
                          <div className="font-bold text-slate-900">{member.issuesDone ?? "--"}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                    path: "/student/my-project",
                  },
                  {
                    icon: Github,
                    text: "Theo dõi contribution GitHub và commit activity",
                    path: "/student/contribution",
                  },
                  {
                    icon: FileText,
                    text: "Upload / theo dõi phiên bản SRS của project",
                    path: "/student/srs",
                  },
                  {
                    icon: Download,
                    text: "Export báo cáo cá nhân phục vụ review và demo",
                    onClick: handleExport,
                  },
                  {
                    icon: ShieldAlert,
                    text: "Nhận cảnh báo từ lecturer khi tiến độ hoặc contribution thấp",
                    path: "/student/alerts",
                  },
                  {
                    icon: Users,
                    text: "Theo dõi tiến độ chung của team và sprint completion",
                    path: "/student/my-project",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.text}
                      type="button"
                      onClick={() => {
                        if (item.onClick) item.onClick();
                        else if (item.path) navigate(item.path);
                      }}
                      className="flex w-full items-start gap-3 rounded-xl p-1 text-left transition hover:bg-slate-50"
                    >
                      <div className="mt-0.5 rounded-lg bg-emerald-50 p-2">
                        <Icon className="h-4 w-4 text-emerald-700" />
                      </div>
                      <span>{item.text}</span>
                    </button>
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
              <h3 className="text-lg font-bold text-slate-900">Gợi ý ưu tiên hôm nay</h3>
              <p className="mt-1 text-sm text-slate-600">
                Hoàn thiện task dashboard Student, xử lý các open issues blocker và cập nhật SRS trước deadline gần nhất.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => navigate(`/student/project/${currentMainProject?.id || "P1"}`)}
              >
                <ArrowUpRight className="h-4 w-4" />
                Mở project chính
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/student/srs")}
              >
                <Clock3 className="h-4 w-4" />
                Xem deadlines / SRS
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}