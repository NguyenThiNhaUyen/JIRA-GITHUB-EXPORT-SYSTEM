// Lecturer Dashboard — Enterprise SaaS (Real API)
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { GroupRadarChart } from "../../components/charts/radar-chart.jsx";
import {
  LayoutList, GitBranch, BookOpen, AlertTriangle,
  Users, Eye, Bell, Settings2, Filter, ChevronRight,
  TrendingUp, Clock, CheckCircle, Activity, FileText
} from "lucide-react";

// Feature Hooks
import { useGetSubjects } from "../../features/system/hooks/useSystem.js";
import { useGetCourses, useGetCourseById, useGetCourseProjectsMetrics } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects, useApproveIntegration, useRejectIntegration } from "../../features/projects/hooks/useProjects.js";
import { useGetAlerts, useResolveAlert } from "../../features/system/hooks/useAlerts.js";
import { useGetLecturerActivityLogs, useGetGroupRadarMetrics } from "../../features/admin/hooks/useAnalytics.js";
import { getProjectKanban, getProjectMetrics, getProjectRoadmap, getProjects } from "../../features/projects/api/projectApi.js";

function getCourseStudentCount(course) {
  if (Array.isArray(course?.enrolledStudents)) return course.enrolledStudents.length;
  if (Array.isArray(course?.enrollments)) return course.enrollments.length;
  if (Array.isArray(course?.students)) return course.students.length;
  return course?.studentCount ?? course?.currentStudents ?? 0;
}

function getCourseGroupCount(course) {
  if (typeof course?.projectsCount === "number") return course.projectsCount;
  if (typeof course?.projectCount === "number") return course.projectCount;
  if (Array.isArray(course?.groups)) return course.groups.length;
  return 0;
}

function lecturerPersonDisplayName(person) {
  if (!person || typeof person !== "object") return null;
  const raw = person.fullName ?? person.name;
  if (typeof raw !== "string" || raw.trim().length === 0) return null;
  const t = raw.trim();
  if (t.includes("GV (ID:")) return null;
  return t;
}

function cleanLecturerString(value) {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t || t.includes("GV (ID:")) return null;
  return t;
}

function getLecturerLabel(course) {
  const single = course?.lecturer;
  if (typeof single === "string") {
    const s = cleanLecturerString(single);
    if (s) return s;
  }
  if (single && !Array.isArray(single)) {
    const n = lecturerPersonDisplayName(single);
    if (n) return n;
  }
  const lecs = course?.lecturers;
  if (!Array.isArray(lecs) || lecs.length === 0) return null;
  const first = lecturerPersonDisplayName(lecs[0]);
  return first ?? null;
}

function tableMemberDisplayName(member) {
  const raw = member?.name ?? member?.studentName ?? member?.fullName;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (t && !t.includes("GV (ID:")) return t;
  }
  return `SV (ID: ${member?.studentId ?? member?.id ?? "N/A"})`;
}

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectOverview, setProjectOverview] = useState({ metrics: null, kanban: null, roadmap: null });
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState("");

  const selectedSubjectId = selectedSubject ? parseInt(selectedSubject) : null;
  const selectedCourseId = selectedCourse ? parseInt(selectedCourse) : null;

  const { data: subjects = [] } = useGetSubjects();
  const { data: coursesData = { items: [] } } = useGetCourses({ pageSize: 100 });
  const { data: course } = useGetCourseById(selectedCourseId);
  const { data: metricsData, isLoading: loadingMetrics } = useGetCourseProjectsMetrics(selectedCourseId);
  const { data: projectsData, isLoading: loadingProjects } = useGetProjects({
    courseId: selectedCourseId ?? undefined,
    pageSize: 100,
    enabled: !!selectedCourseId,
  });
  const { data: alertsData } = useGetAlerts({ pageSize: 5 });
  const { data: activityLogRaw } = useGetLecturerActivityLogs(8);

  // Normalize activityLog — BE trả về AuditLogResponse[]: { type, message, time, timestamp }
  const ICON_MAP_ACT = {
    info: { icon: GitBranch, color: "text-teal-600 bg-teal-50" },
    success: { icon: CheckCircle, color: "text-green-600 bg-green-50" },
    warning: { icon: FileText, color: "text-indigo-600 bg-indigo-50" },
    error: { icon: BookOpen, color: "text-blue-600 bg-blue-50" },
  };
  const activityLog = Array.isArray(activityLogRaw) ? activityLogRaw.map((log, i) => ({
    id: i + 1,
    ...(ICON_MAP_ACT[log.type] || ICON_MAP_ACT.info),
    msg: log.message,
    time: log.time || new Date(log.timestamp).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
  })) : [];


  const approveIntMutation = useApproveIntegration();
  const rejectIntMutation = useRejectIntegration();
  const resolveAlertMutation = useResolveAlert();

  const courses = (Array.isArray(coursesData?.items) ? coursesData.items : []).filter(
    (c) => {
      const sid = c?.subjectId ?? c?.subject_id ?? c?.subject?.id;
      return !selectedSubjectId || String(sid) === String(selectedSubjectId);
    }
  );
  const groups = Array.isArray(projectsData?.items) ? projectsData.items : [];

  const handleManageGroups = () => {
    if (!selectedCourse) { error("Vui lòng chọn lớp học"); return; }
    navigate(`/lecturer/course/${selectedCourse}/manage-groups`);
  };

  const handleSendWarning = (group) =>
    success(`Đã gửi cảnh báo đến nhóm "${group?.name ?? `Nhóm (ID: ${group?.id ?? "N/A"})`}"`);

  const handleApprovePending = async (groupId, type) => {
    try {
      await approveIntMutation.mutateAsync(groupId);
      success(`Đã duyệt tích hợp cho nhóm`);
    } catch (err) {
      error(err.message || `Lỗi khi duyệt tích hợp`);
    }
  };

  const handleRejectPending = async (groupId, type) => {
    const reason = prompt("Nhập lý do từ chối học kỳ/tích hợp:");
    if (reason === null) return;
    try {
      await rejectIntMutation.mutateAsync({ projectId: groupId, reason });
      success(`Đã từ chối tích hợp`);
    } catch (err) {
      error(err.message || `Lỗi khi từ chối tích hợp`);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await resolveAlertMutation.mutateAsync(alertId);
      success("Đã đánh dấu cảnh báo là đã xử lý");
    } catch (err) {
      error(err.message || "Không thể xử lý cảnh báo");
    }
  };

  // Derived stats
  const stats = {
    total: groups.length,
    github: groups.filter(g => g.integration?.githubStatus === "APPROVED").length,
    jira: groups.filter(g => g.integration?.jiraStatus === "APPROVED").length,
    alerts: groups.filter(g => g.integration?.githubStatus !== "APPROVED" || g.integration?.jiraStatus !== "APPROVED").length,
  };
  const alertsList = (Array.isArray(alertsData?.items) ? alertsData.items : []).filter((a) => a?.status === "OPEN").map((a) => {
    // BUG-43: Standardized severity mapping (CRITICAL, HIGH, URGENT -> error)
    const sev = a.severity?.toUpperCase() || "";
    const isCritical = ["HIGH", "CRITICAL", "URGENT"].includes(sev);
    return {
      id: a.id,
      name: a?.groupName ?? `Nhóm (ID: ${a?.groupId ?? "N/A"})`,
      msg: a.message,
      severity: isCritical ? "error" : "warning"
    };
  });
  const currentSubject = (Array.isArray(subjects) ? subjects : []).find((s) => String(s?.id) === String(selectedSubjectId));
  const currentCourse = courses.find((c) => String(c?.id) === String(selectedCourseId));
  const courseMeta = course ?? currentCourse ?? null;
  const courseStudentTotal = selectedCourseId
    ? (getCourseStudentCount(courseMeta) || null)
    : null;
  const courseGroupTotal = selectedCourseId
    ? (getCourseGroupCount(courseMeta) || groups.length || null)
    : null;
  const courseLecturerLabel = selectedCourseId ? getLecturerLabel(courseMeta) : null;
  const selectedProject = useMemo(
    () => groups.find((g) => String(g.id) === String(selectedProjectId)),
    [groups, selectedProjectId]
  );

  useEffect(() => {
    const projectIdFromUrl = searchParams.get("projectId");
    if (projectIdFromUrl) {
      setSelectedProjectId(projectIdFromUrl);
      return;
    }
    if (!selectedCourseId) {
      setSelectedProjectId(null);
      return;
    }
    if (groups.length > 0) {
      setSelectedProjectId(String(groups[0].id));
      return;
    }
    let isMounted = true;
    async function resolveByCourse() {
      try {
        const data = await getProjects({ courseId: selectedCourseId, pageSize: 100 });
        const first = data?.items?.[0];
        if (isMounted) setSelectedProjectId(first ? String(first.id) : null);
      } catch {
        if (isMounted) setSelectedProjectId(null);
      }
    }
    resolveByCourse();
    return () => {
      isMounted = false;
    };
  }, [searchParams, selectedCourseId, groups]);

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectOverview({ metrics: null, kanban: null, roadmap: null });
      setOverviewError("");
      return;
    }
    let isMounted = true;
    async function loadProjectOverview() {
      setOverviewLoading(true);
      setOverviewError("");
      try {
        const [metrics, kanban, roadmap] = await Promise.all([
          getProjectMetrics(selectedProjectId),
          getProjectKanban(selectedProjectId),
          getProjectRoadmap(selectedProjectId),
        ]);
        if (!isMounted) return;
        setProjectOverview({ metrics, kanban, roadmap });
      } catch (err) {
        if (!isMounted) return;
        setOverviewError(err?.message || "Không thể tải dữ liệu overview của project");
      } finally {
        if (isMounted) setOverviewLoading(false);
      }
    }
    loadProjectOverview();
    return () => {
      isMounted = false;
    };
  }, [selectedProjectId]);

  const pendingIntegrations = groups.filter(
    g => g.integration?.githubStatus === "PENDING" || g.integration?.jiraStatus === "PENDING"
  );

  // Build RadarChart data from real analytics API (Safe Mapping BUG-46)
  const radarData = Array.isArray(metricsData) ? metricsData.map(group => {
    return {
      groupName: group.projectName ?? group.groupName ?? "",
      commits: group.commitsCount ?? group.commits ?? 0,
      srsDone: group.srsReportsCount ?? group.srsDone ?? 0,
      teamSize: group.teamSize ?? 0,
      githubLinked: group.isGithubLinked ? 1 : (group.githubLinked ?? 0),
      jiraLinked: group.isJiraLinked ? 1 : (group.jiraLinked ?? 0),
    };
  }) : [];


  return (
    <div className="space-y-7">
      {/* ── Breadcrumb ──────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
        <span className="text-teal-700 font-semibold">Giảng viên</span>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-semibold">Tổng quan</span>
        {currentSubject && <><ChevronRight size={12} /><span>{currentSubject.code}</span></>}
        {currentCourse && <><ChevronRight size={12} /><span className="font-semibold text-gray-800">{currentCourse.code}</span></>}
      </nav>

      {/* ── C. Command Bar / Control Panel ───── */}
      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-teal-600" />
              <CardTitle className="text-base font-semibold text-gray-800">Bộ lọc lớp học</CardTitle>
            </div>
            {selectedCourse && (
              <Button
                onClick={handleManageGroups}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm h-9 px-5 shadow-sm border-0 transition-all focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
              >
                <Settings2 size={14} />Quản lý nhóm
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-5 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SelectField
              label="Môn học"
              value={selectedSubject}
              onChange={e => {
                setSelectedSubject(e.target.value);
                setSelectedCourse(""); // BUG-41: Reset course when subject changes
              }}
            >
              <option value="">— Chọn môn học —</option>
              {(Array.isArray(subjects) ? subjects : []).map((s) => <option key={s?.id} value={s?.id}>{s?.code} – {s?.name}</option>)}
            </SelectField>
            <SelectField label="Lớp học" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} disabled={!selectedSubject || courses.length === 0}>
              <option value="">— Chọn lớp học —</option>
              {courses.map((c) => <option key={c?.id} value={c?.id}>{c?.code}</option>)}
            </SelectField>
            <SelectField label="Bộ lọc" value={filter} onChange={e => setFilter(e.target.value)} disabled={!selectedCourse}>
              <option value="all">Tất cả nhóm</option>
              <option value="inactive-students">Ít commit</option>
              <option value="inactive-groups">Chưa hoàn thành</option>
            </SelectField>
          </div>
          {selectedCourse && (
            <div className="mt-5 pt-5 border-t border-gray-50 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-gray-600">GV phụ trách:</span>
                {courseLecturerLabel ? (
                  <span className="text-gray-600">{courseLecturerLabel}</span>
                ) : (
                  <span className="inline-flex items-center rounded-lg border border-gray-100 bg-white px-2 py-0.5 text-gray-400">
                    Chưa phân công
                  </span>
                )}
              </span>
              <span><span className="font-semibold text-gray-600">Sinh viên:</span> {courseStudentTotal ?? 0}</span>
              <span><span className="font-semibold text-gray-600">Nhóm:</span> {courseGroupTotal ?? 0}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── A. Summary Stats ────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={<LayoutList size={20} />} color="bg-blue-500" label="Tổng nhóm" value={selectedCourse ? (courseGroupTotal ?? groups.length ?? 0) : "—"} />
        <StatCard icon={<Users size={20} />} color="bg-violet-500" label="Sinh viên lớp" value={selectedCourse ? (courseStudentTotal ?? 0) : "—"} />
        <StatCard icon={<GitBranch size={20} />} color="bg-teal-500" label="GitHub đã duyệt" value={selectedCourse ? stats.github : "—"} />
        <StatCard icon={<BookOpen size={20} />} color="bg-indigo-500" label="Jira đã duyệt" value={selectedCourse ? stats.jira : "—"} />
        <StatCard icon={<AlertTriangle size={20} />} color="bg-orange-400" label="Cần cảnh báo" value={selectedCourse ? stats.alerts : "—"} />
      </div>

      {selectedCourse && (
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-semibold text-gray-800">
              Project Overview
              {selectedProject && <span className="ml-1 text-sm font-normal text-gray-400">— {selectedProject?.name ?? `Nhóm (ID: ${selectedProject?.id ?? "N/A"})`}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {overviewLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-gray-400">Đang tải metrics/kanban/roadmap...</div>
            ) : overviewError ? (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{overviewError}</div>
            ) : !selectedProjectId ? (
              <div className="text-sm text-gray-400">Chưa có project để hiển thị overview.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/40">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Metrics</p>
                  <p className="mt-2 text-sm text-gray-700">Commits: <span className="font-bold">{projectOverview.metrics?.totalCommits ?? 0}</span></p>
                  <p className="text-sm text-gray-700">Issues: <span className="font-bold">{projectOverview.metrics?.totalIssues ?? 0}</span></p>
                </div>
                <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/40">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Kanban</p>
                  <p className="mt-2 text-sm text-gray-700">To do: <span className="font-bold">{projectOverview.kanban?.todo?.length ?? 0}</span></p>
                  <p className="text-sm text-gray-700">In progress: <span className="font-bold">{projectOverview.kanban?.in_progress?.length ?? 0}</span></p>
                  <p className="text-sm text-gray-700">Done: <span className="font-bold">{projectOverview.kanban?.done?.length ?? 0}</span></p>
                </div>
                <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/40">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Roadmap</p>
                  <p className="mt-2 text-sm text-gray-700">Milestones: <span className="font-bold">{projectOverview.roadmap?.milestones?.length ?? 0}</span></p>
                  <p className="text-sm text-gray-700">Sprints: <span className="font-bold">{projectOverview.roadmap?.sprints?.length ?? 0}</span></p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── B. Activity & Alerts (2-col) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Alerts */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                <AlertTriangle size={15} className="text-orange-500" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">Cảnh báo gần đây</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {alertsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCircle size={28} className="text-green-400" />
                <p className="text-sm text-gray-400">Không có cảnh báo nào</p>
              </div>
            ) : alertsList.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0 group">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-orange-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.name}</p>
                  <p className="text-xs text-orange-600 mt-0.5">{a.msg}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleResolveAlert(a.id)}
                    className="shrink-0 text-gray-400 hover:text-green-600 transition-colors p-1"
                    title="Đánh dấu đã xử lý"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleSendWarning({ name: a.name })}
                    className="shrink-0 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Bell size={11} className="inline mr-1" />Nhắc
                  </button>
                </div>
              </div>
            ))}
            <div className="px-5 py-3 border-t border-gray-50">
              <button onClick={() => navigate("/lecturer/alerts")} className="text-xs text-teal-600 font-medium hover:underline">
                Xem tất cả cảnh báo →
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <Activity size={15} className="text-teal-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">Hoạt động gần đây</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activityLog.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-gray-400 text-sm">Không có hoạt động nào gần đây</div>
            ) : activityLog.map(act => (
              <div key={act.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                  <act.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{act.msg}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock size={10} />{act.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── D. Group Overview ────────────────── */}
      {selectedCourse && (
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">
                Nhóm {currentCourse && <span className="text-gray-400 font-normal ml-1">— {currentCourse.code}</span>}
              </CardTitle>
              <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-3 py-1 font-medium border border-gray-100">
                {courseGroupTotal ?? groups.length} nhóm
              </span>
            </div>
          </CardHeader>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Nhóm / Đề tài</div>
            <div className="col-span-3 hidden md:block text-center">Thành viên</div>
            <div className="col-span-3 hidden md:block text-center">Trạng thái</div>
            <div className="col-span-12 md:col-span-2 text-right">Thao tác</div>
          </div>

          <CardContent className="p-0">
            {loadingProjects ? (
              <LoadingRows />
            ) : groups.length === 0 ? (
              <EmptyGroups onAction={handleManageGroups} />
            ) : (
              <div className="divide-y divide-gray-50">
                {groups.map(group => {
                  const githubOk = group.integration?.githubStatus === "APPROVED";
                  const jiraOk = group.integration?.jiraStatus === "APPROVED";
                  const safeStudents = Array.isArray(group?.team) ? group.team : [];
                  return (
                    <GroupRow
                      key={group.id}
                      group={group}
                      students={safeStudents}
                      githubOk={githubOk}
                      jiraOk={jiraOk}
                      onDetail={() => navigate(`/lecturer/group/${group.id}`)}
                      onWarn={() => handleSendWarning(group)}
                      onSelect={() => setSelectedProjectId(String(group.id))}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Duyệt Tích hợp của Lớp (Pending Integrations) ──────── */}
      {selectedCourse && pendingIntegrations.length > 0 && (
        <Card className="border border-amber-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-amber-50 pb-4 bg-amber-50/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={15} className="text-amber-600" />
              </div>
              <CardTitle className="text-base font-semibold text-amber-900">Duyệt Link Tích Hợp</CardTitle>
              <span className="text-xs text-amber-700 bg-amber-100 rounded-full px-3 py-1 font-bold border border-amber-200 ml-auto">
                {pendingIntegrations.length} yêu cầu
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-amber-50">
              {pendingIntegrations.map(group => (
                <div key={`pending-${group.id}`} className="px-6 py-4 hover:bg-amber-50/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-gray-800">{group?.name ?? `Nhóm (ID: ${group?.id ?? "N/A"})`}</p>
                    <button
                      onClick={() => navigate(`/lecturer/group/${group.id}`)}
                      className="text-[10px] font-semibold text-teal-600 hover:underline"
                    >
                      Xem chi tiết nhóm →
                    </button>
                  </div>

                  {/* GitHub Pending */}
                  {group.integration?.githubStatus === "PENDING" && (
                    <div className="flex items-center justify-between bg-gray-50/80 p-3 rounded-xl border border-gray-100 mb-2">
                      <div className="flex items-center gap-2 overflow-hidden mr-4">
                        <GitBranch size={14} className="text-gray-600 shrink-0" />
                        <a href={group.integration?.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                          {group.integration?.githubUrl}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" onClick={() => handleApprovePending(group.id, 'github')} className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-bold shadow-sm">Duyệt</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectPending(group.id, 'github')} className="h-7 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold shadow-sm">Từ chối</Button>
                      </div>
                    </div>
                  )}

                  {/* Jira Pending */}
                  {group.integration?.jiraStatus === "PENDING" && (
                    <div className="flex items-center justify-between bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 overflow-hidden mr-4">
                        <BookOpen size={14} className="text-gray-600 shrink-0" />
                        <a href={group.integration?.jiraUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                          {group.integration?.jiraUrl}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" onClick={() => handleApprovePending(group.id, 'jira')} className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-bold shadow-sm">Duyệt</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectPending(group.id, 'jira')} className="h-7 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold shadow-sm">Từ chối</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      {/* ── E. RadarChart — So sánh Nhóm (Loading State BUG-45) ──────── */}
      {selectedCourse && (loadingMetrics ? (
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardContent className="py-20 flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
             <p className="text-xs text-gray-400 animate-pulse">Đang phân tích dữ liệu so sánh...</p>
          </CardContent>
        </Card>
      ) : radarData.length > 0 && (
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                </svg>
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">So sánh Nhóm</CardTitle>
              <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-3 py-1 font-medium border border-gray-100 ml-auto">
                {Math.max(courseGroupTotal ?? 0, radarData.length)} nhóm · {currentCourse?.code}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <p className="text-xs text-gray-400 mb-4 text-center">
              So sánh 5 chỉ số: Commits · SRS Done · Team Size · GitHub · Jira (đã chuẩn hoá 0–100)
            </p>
            <GroupRadarChart data={radarData} />
          </CardContent>
        </Card>
      ))}

      {/* Empty state when no course selected */}
      {!selectedCourse && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 rounded-3xl bg-teal-50 flex items-center justify-center shadow-inner">
            <TrendingUp size={36} className="text-teal-400" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-gray-700">Chọn lớp học để xem dashboard</p>
            <p className="text-sm text-gray-400">Sử dụng bộ lọc phía trên để chọn môn học và lớp học</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ───────────────────────────────── */

function StatCard({ icon, color, label, value }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shrink-0 shadow-inner`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800 leading-none mt-0.5">{value}</h3>
      </div>
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed" {...props}>
        {children}
      </select>
    </div>
  );
}

function cleanGroupTitle(group) {
  const raw = group?.name;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (t && !t.includes("GV (ID:")) return t;
  }
  return `Nhóm (ID: ${group?.id ?? "N/A"})`;
}

function cleanGroupTopic(group) {
  const raw = group?.topic ?? group?.description;
  if (typeof raw !== "string") return "";
  const t = raw.trim();
  if (!t || t.includes("GV (ID:")) return "";
  return t;
}

function GroupRow({ group, students, githubOk, jiraOk, onDetail, onWarn, onSelect }) {
  const safeStudents = Array.isArray(students) ? students : [];
  const hasAlert = !githubOk || !jiraOk;
  return (
    <div onClick={onSelect} className={`grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors border-l-4 cursor-pointer ${hasAlert ? "border-l-orange-300" : "border-l-transparent"}`}>
      <div className="col-span-7 md:col-span-4">
        <p className="font-semibold text-gray-800 text-sm leading-snug">{cleanGroupTitle(group)}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">
          {cleanGroupTopic(group) || <span className="italic">Chưa có đề tài</span>}
        </p>
      </div>
      <div className="col-span-3 hidden md:flex items-center justify-center gap-1">
        <div className="flex -space-x-2">
          {safeStudents.slice(0, 3).map((s, idx) => {
            const displayName = tableMemberDisplayName(s);
            return (
            <div key={s?.id ?? s?.studentId ?? idx} className="w-7 h-7 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-teal-700" title={displayName}>
              {displayName?.charAt?.(0) ?? "S"}
            </div>
          )})}
          {safeStudents.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-gray-500">
              +{safeStudents.length - 3}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 ml-1">{safeStudents.length} SV</span>
      </div>
      <div className="col-span-3 hidden md:flex items-center justify-center gap-2">
        <StatusPill ok={githubOk} icon={<GitBranch size={10} />} label="GitHub" />
        <StatusPill ok={jiraOk} icon={<BookOpen size={10} />} label="Jira" />
      </div>
      <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-2">
        <button onClick={onDetail} className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg px-3 py-1.5 transition-colors border border-teal-100">
          <Eye size={12} />Chi tiết
        </button>
        <button onClick={onWarn} className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg px-3 py-1.5 transition-colors border border-orange-100" title="Gửi cảnh báo">
          <Bell size={12} />
        </button>
      </div>
    </div>
  );
}

function StatusPill({ ok, icon, label }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${ok ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
      {icon}{label}{ok && " ✓"}
    </span>
  );
}

function LoadingRows() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      <p className="text-sm text-gray-400">Đang tải...</p>
    </div>
  );
}

function EmptyGroups({ onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Users size={24} className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">Chưa có nhóm nào trong lớp học này.</p>
      <Button onClick={onAction} className="mt-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm h-9 px-5 shadow-sm border-0">
        + Tạo nhóm đầu tiên
      </Button>
    </div>
  );
}
