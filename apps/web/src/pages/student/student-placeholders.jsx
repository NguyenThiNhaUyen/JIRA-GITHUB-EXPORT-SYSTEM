import { useMemo } from "react";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects, useGetProjectMetrics } from "../../features/projects/hooks/useProjects.js";
import { useGetAlerts } from "../../features/system/hooks/useAlerts.js";
import { useGetProjectSrs } from "../../features/srs/hooks/useSrs.js";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  GitBranch,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  BookOpen,
  BarChart2,
  Users,
  Activity,
  FileDown,
  FolderKanban,
  Eye,
  RefreshCw,
  Upload,
  FileText,
  Target,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

/* ───────────────────────── UI helpers ───────────────────────── */

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50">
        <Icon size={32} className="text-gray-300" />
      </div>
      <p className="font-semibold text-gray-700">{title}</p>
      {desc ? <p className="text-sm text-gray-400">{desc}</p> : null}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-gray-800">{title}</h2>
      <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function SummaryCard({ icon: Icon, color, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color} text-white`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

function Breadcrumb({ title }) {
  const navigate = useNavigate();
  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
      <span
        className="cursor-pointer font-semibold text-teal-700 hover:underline"
        onClick={() => navigate("/student")}
      >
        Sinh viên
      </span>
      <ChevronRight size={12} />
      <span className="font-semibold text-gray-800">{title}</span>
    </nav>
  );
}

/* ═══════════ Courses Page ═══════════ */

export default function StudentCoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: coursesData } = useGetCourses({ pageSize: 100 });
  const { data: projectsData } = useGetProjects({ pageSize: 100 });
  const coursesList = coursesData?.items || [];
  const projectsList = projectsData?.items || [];

  return (
    <div className="space-y-6">
      <Breadcrumb title="Lớp của tôi" />
      <SectionHeader
        title="Lớp học của tôi"
        subtitle="Tất cả lớp học phần bạn đang tham gia"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={BookOpen}
          color="bg-teal-500"
          label="Tổng số lớp"
          value={coursesList.length}
        />
        <SummaryCard
          icon={FolderKanban}
          color="bg-blue-500"
          label="Project đang tham gia"
          value={projectsList.length}
        />
        <SummaryCard
          icon={Target}
          color="bg-emerald-500"
          label="Lớp đang hoạt động"
          value={coursesList.filter((c) => c.status === "ACTIVE").length}
        />
      </div>

      {coursesList.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Bạn chưa được đăng ký lớp nào"
          desc="Hiện chưa có khóa học nào hiển thị trong tài khoản này"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {coursesList.map((course) => {
            const project = projectsList.find((p) => p.courseId === course.id);
            const isLeader = project?.teamLeaderId === user?.id;

            return (
              <Card
                key={course.id}
                className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="h-1 bg-gradient-to-r from-teal-500 to-blue-500" />
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mb-1 inline-block rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">
                        {course.subject?.code || course.code}
                      </p>
                      <h4 className="text-base font-bold text-gray-800">{course.name}</h4>
                      <p className="mt-1 text-xs text-gray-500">
                        {course.lecturerNames?.join(", ") || "Chưa có GV"}
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">
                      {course.status}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-gray-600">{course.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Học kỳ</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {typeof course.semester === "object"
                          ? course.semester?.name
                          : course.semester || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Số tín chỉ</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{course.credits}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Lịch học</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{course.schedule}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Phòng</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{course.room}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Tiến độ môn học</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-teal-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {project ? (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">{project.name}</p>
                          <p className="mt-1 text-[11px] text-gray-500">
                            Repo: {project.repositoryName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Jira: {project.jiraProjectKey}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                            isLeader
                              ? "border-amber-100 bg-amber-50 text-amber-700"
                              : "border-gray-200 bg-white text-gray-500"
                          }`}
                        >
                          {isLeader ? "Leader" : "Member"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-400">
                      Chưa có project được gán cho lớp này
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate("/student/my-project")}
                    >
                      <FolderKanban size={15} />
                      Nhóm của tôi
                    </Button>

                    {project ? (
                      <Button
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate(`/student/project/${project.id}`)}
                      >
                        <Eye size={15} />
                        Xem project
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate("/student")}
                      >
                        <ExternalLink size={15} />
                        Về dashboard
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════ My Project Page ═══════════ */

export function StudentMyProjectPage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const { user } = useAuth();

  const { data: projectsData } = useGetProjects({ pageSize: 100 });
  const myProjects = projectsData?.items || [];

  return (
    <div className="space-y-6">
      <Breadcrumb title="Nhóm của tôi" />
      <SectionHeader
        title="Nhóm / Project của tôi"
        subtitle="Danh sách project bạn đang tham gia trong các môn học"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={FolderKanban}
          color="bg-teal-500"
          label="Số project tham gia"
          value={myProjects.length}
        />
        <SummaryCard
          icon={Users}
          color="bg-blue-500"
          label="Vai trò Leader"
          value={myProjects.filter((p) => p.teamLeaderId === user?.id).length}
        />
        <SummaryCard
          icon={Activity}
          color="bg-green-500"
          label="Project đang hoạt động"
          value={myProjects.length}
        />
      </div>

      {myProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Bạn chưa tham gia project nào"
          desc="Khi được thêm vào nhóm, project sẽ hiển thị ở đây"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {myProjects.map((project) => {
            const isLeader = project.teamLeaderId === user?.id;
            const memberCount = project.team?.length || 0;

            return (
              <Card
                key={project.id}
                className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm"
              >
                <div className="h-1 bg-gradient-to-r from-teal-500 to-blue-500" />
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{project.name}</h4>
                      <p className="mt-1 text-xs text-gray-500">
                        {project.course?.name || "Lớp học"} · {project.course?.subject?.code || "COURSE"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                        isLeader
                          ? "border-amber-100 bg-amber-50 text-amber-700"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    >
                      {isLeader ? "Leader" : "Member"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Repository</p>
                      <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                        {project.repositoryName}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Jira Project</p>
                      <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                        {project.jiraProjectKey}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Team size</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {memberCount} thành viên
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3">
                      <p className="text-[11px] text-gray-500">Trạng thái</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-700">ACTIVE</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate(`/student/project/${project.id}`)}
                    >
                      <Eye size={15} />
                      Xem chi tiết
                    </Button>

                    <Button
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                      onClick={() => success?.(`Đã đồng bộ mock commits cho project ${project.name}`)}
                    >
                      <RefreshCw size={15} />
                      Sync commits
                    </Button>

                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => success?.(`Mở mock upload SRS cho project ${project.name}`)}
                    >
                      <Upload size={15} />
                      Nộp SRS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════ Contribution Page ═══════════ */

export function StudentContributionPage() {
  const { user } = useAuth();
  const { data: projectsData } = useGetProjects({ pageSize: 100 });
  const myGroups = projectsData?.items || [];
  const totalMyCommits = useMemo(() => {
    return myGroups.reduce((sum, project) => sum + (project.commits || 0), 0);
  }, [myGroups]);
  const activeGroups = useMemo(() => {
    return myGroups.filter((project) => (project.commits || 0) > 0).length;
  }, [myGroups]);

  return (
    <div className="space-y-6">
      <Breadcrumb title="Đóng góp của tôi" />
      <SectionHeader
        title="Đóng góp của tôi"
        subtitle="Tổng quan commit và đóng góp cá nhân theo nhóm"
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={GitBranch}
          color="bg-teal-500"
          label="Tổng commits của tôi"
          value={totalMyCommits}
        />
        <SummaryCard
          icon={Users}
          color="bg-blue-500"
          label="Nhóm tham gia"
          value={myGroups.length}
        />
        <SummaryCard
          icon={Activity}
          color="bg-green-500"
          label="Nhóm có hoạt động"
          value={activeGroups}
        />
      </div>

      {myGroups.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="Bạn chưa tham gia nhóm nào"
          desc="Khi có project, contribution sẽ hiển thị ở đây"
        />
      ) : (
        myGroups.map((g) => (
          <ProjectContributionCard key={g.id} project={g} userId={user?.id} />
        ))
      )}
    </div>
  );
}

function ProjectContributionCard({ project, userId }) {
  const { data: metricsData } = useGetProjectMetrics(project.id);
  const metrics = metricsData || { studentMetrics: [], totalCommits: 0 };
  const members = project.team || [];

  if (!metrics) return null;

  const myMetric =
    metrics.studentMetrics?.find((m) => String(m.studentId) === String(userId)) || {
      commitCount: 0,
    };

  const maxCommits = Math.max(
    ...(metrics.studentMetrics?.map((m) => m.commitCount) || [1]),
    1
  );

  return (
    <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
      <CardHeader className="border-b border-gray-50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-800">
              {project.name}
            </CardTitle>
            <p className="mt-0.5 text-xs text-gray-400">{project.course?.name || "Lớp học"}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold text-teal-700">{myMetric.commitCount}</p>
              <p className="text-[10px] text-gray-400">My commits</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-700">{metrics.totalCommits || 0}</p>
              <p className="text-[10px] text-gray-400">Total</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-5 py-4">
        {metrics.studentMetrics?.map((m) => {
          const student =
            members.find((s) => String(s.studentId) === String(m.studentId)) || {
              studentName: "Unknown",
            };
          const isMe = String(m.studentId) === String(userId);

          return (
            <div key={m.studentId} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isMe ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {student.studentName?.charAt(0) || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">
                    {student.studentName}
                  </span>
                  {isMe && (
                    <span className="rounded-full border border-teal-100 bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-600">
                      Bạn
                    </span>
                  )}
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${isMe ? "bg-teal-500" : "bg-gray-300"}`}
                    style={{ width: `${(m.commitCount / maxCommits) * 100}%` }}
                  />
                </div>
              </div>

              <span className="shrink-0 text-xs font-bold text-gray-600">{m.commitCount}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ═══════════ Alerts Page ═══════════ */

export function StudentAlertsPage() {
  const { data: alertsData } = useGetAlerts({ pageSize: 100 });
  const alerts = alertsData?.items || [];

  const sevCls = {
    high: {
      border: `${({
  high: { cls: "bg-red-50 border-red-100" },
  medium: { cls: "bg-orange-50 border-orange-100" },
  info: { cls: "bg-blue-50 border-blue-100" },
}).high?.cls || "bg-red-50 border-red-100"} border`,
      icon: "text-red-500",
      text: "text-red-800",
    },
    medium: {
      border: `${({
  high: { cls: "bg-red-50 border-red-100" },
  medium: { cls: "bg-orange-50 border-orange-100" },
  info: { cls: "bg-blue-50 border-blue-100" },
}).medium?.cls || "bg-orange-50 border-orange-100"} border`,
      icon: "text-orange-500",
      text: "text-orange-800",
    },
    info: {
      border: "border border-blue-100 bg-blue-50",
      icon: "text-blue-500",
      text: "text-blue-800",
    },
  };

  return (
    <div className="space-y-6">
      <Breadcrumb title="Cảnh báo" />
      <SectionHeader
        title="Cảnh báo cá nhân"
        subtitle="Nhắc nhở từ hệ thống liên quan đến các nhóm của bạn"
      />

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          icon={Bell}
          color="bg-orange-400"
          label="Tổng cảnh báo"
          value={alerts.length}
        />
        <SummaryCard
          icon={AlertTriangle}
          color="bg-red-400"
          label="Cần xử lý ngay"
          value={alerts.filter((a) => String(a.severity).toLowerCase() === "high").length}
        />
      </div>

      <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-green-50">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <p className="font-semibold text-gray-700">Không có cảnh báo nào!</p>
              <p className="text-sm text-gray-400">
                Tất cả nhóm của bạn đang hoạt động tốt 🎉
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {alerts.map((a, i) => {
                const severity = String(a.severity || "info").toLowerCase();
                const cls = sevCls[severity] || sevCls.info;

                return (
                  <div
                    key={a.id || i}
                    className={`flex items-start gap-3 px-5 py-4 ${cls.border} border-b last:border-0`}
                  >
                    <AlertTriangle size={15} className={`mt-0.5 shrink-0 ${cls.icon}`} />
                    <div className="flex-1">
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {a.groupName || "Nhóm"}
                      </p>
                      <p className={`text-sm ${cls.text}`}>{a.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════ SRS Page ═══════════ */

export function StudentSrsPage() {
  const { success } = useToast();
  const { data: projectsData } = useGetProjects({ pageSize: 100 });
  const myGroups = projectsData?.items || [];
  const srsSummary = { SUBMITTED: 0, UNDER_REVIEW: 0, NEEDS_REVISION: 0, APPROVED: 0, REJECTED: 0 };

  return (
    <div className="space-y-6">
      <Breadcrumb title="SRS Reports" />
      <SectionHeader
        title="SRS Reports của nhóm"
        subtitle="Xem lịch sử nộp SRS và phản hồi từ admin"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {["SUBMITTED", "UNDER_REVIEW", "NEEDS_REVISION", "APPROVED", "REJECTED"].map((s) => (
          <div
            key={s}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${({
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  NEEDS_REVISION: "bg-red-50 text-red-700 border-red-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-700 border-slate-200",
})[String(rpt.status || "SUBMITTED").toUpperCase()]}`}
          >
            <span className="text-[11px] font-semibold">{s}</span>
            <span className="text-xl font-bold">{srsSummary[s]}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => success?.("Mở mock form nộp SRS mới lên admin")}
        >
          <Upload size={16} />
          Nộp SRS mới
        </Button>
      </div>

      <Card className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-0">
          {myGroups.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nhóm chưa có SRS nào được nộp"
              desc="Khi có file SRS, danh sách sẽ hiển thị ở đây"
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {myGroups.map((g) => (
                <ProjectSrsRows key={g.id} project={g} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectSrsRows({ project }) {
  const { success } = useToast();
  const { data: srsData } = useGetProjectSrs(project.id);
  const srsList = srsData?.items || [];

  if (srsList.length === 0) return null;

  return (
    <>
      {srsList.map((rpt) => (
        <div
          key={rpt.id}
          className="flex items-center gap-4 border-b border-gray-50 px-5 py-4 transition-colors last:border-0 hover:bg-gray-50/50"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-gray-700">
                v{rpt.version}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                  ({
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  NEEDS_REVISION: "bg-red-50 text-red-700 border-red-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-700 border-slate-200",
})[String(rpt.status || "SUBMITTED").toUpperCase()] ||
                  "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {rpt.status}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {rpt.receiver || "Admin"}
              </span>
            </div>

            <p className="truncate text-xs text-gray-500">
              {project.name} · {project.course?.name || "Lớp"}
            </p>

            {rpt.feedback ? (
              <p className="mt-0.5 text-xs italic text-blue-600">
                Phản hồi admin: {rpt.feedback}
              </p>
            ) : null}

            <div className="mt-1.5 flex items-center justify-between">
              <p className="flex items-center gap-1 text-[10px] text-gray-400">
                <Clock size={9} />
                {new Date(rpt.submittedAt).toLocaleDateString("vi-VN")}
              </p>

              <div className="flex items-center gap-2">
                <a
                  href={rpt.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:underline"
                >
                  <FileDown size={10} />
                  Tải file
                </a>

                <button
                  type="button"
                  onClick={() => success?.(`Đã mở mock file SRS v${rpt.version}`)}
                  className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
                >
                  <Eye size={10} />
                  Xem
                </button>

                <button
                  type="button"
                  onClick={() => success?.(`Mở mock nộp lại SRS version mới cho ${project.name}`)}
                  className="flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:underline"
                >
                  <Upload size={10} />
                  Nộp lại
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}