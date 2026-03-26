// Admin Dashboard — Enterprise SaaS Governance
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import {
  BookOpen, Library, CalendarDays, Users, GraduationCap,
  FolderKanban, TrendingUp, UserCog, Plus, ChevronRight,
  Activity, CheckCircle, AlertCircle, Clock, WifiOff
} from "lucide-react";

// Feature Hooks
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects } from "../../features/projects/hooks/useProjects.js";
import { useGetSemesters, useGetSubjects, useGetDashboardStats } from "../../features/system/hooks/useSystem.js";
import { useGetActivityLog, useGetIntegrationStats, useGetTeamRankings, useGetInactiveTeams } from "../../features/admin/hooks/useAnalytics.js";



export default function AdminDashboard() {
  const navigate = useNavigate();

  // Data Fetching
  const { data: dashboardStats, isLoading: loadingStats } = useGetDashboardStats();
  const { data: coursesData, isLoading: loadingCourses, error: courseError } = useGetCourses({ page: 1, pageSize: 6 });
  const { data: semesters = [], isLoading: loadingSems } = useGetSemesters();
  const { data: subjects = [], isLoading: loadingSubs } = useGetSubjects();
  const { data: projectsData, isLoading: loadingProjects } = useGetProjects({ pageSize: 1 });
  const { data: activityLogRaw } = useGetActivityLog(8);
  const { data: integrationStats } = useGetIntegrationStats();
  const { data: teamRankingsRaw } = useGetTeamRankings(5);
  const { data: inactiveTeamsRaw } = useGetInactiveTeams();

  // Used to map AuditLog entity IDs → human-readable course code.
  // (Backend AuditLogResponse currently only returns Message/Time/Timestamp,
  // so we attempt mapping on FE using the recent courses we already fetch.)
  const recentCourses = Array.isArray(coursesData?.items) ? coursesData.items : [];
  const courseCodeById = recentCourses.reduce((acc, c) => {
    if (!c?.id) return acc;
    acc[String(c.id)] = c?.code ?? c?.course_code ?? c?.name ?? "";
    return acc;
  }, {});

  // Normalize activityLog — BE trả về AuditLogResponse[]: { type, message, time, timestamp }
  const ICON_MAP = {
    info: { icon: Activity, color: "text-blue-600 bg-blue-50" },
    success: { icon: CheckCircle, color: "text-green-600 bg-green-50" },
    warning: { icon: AlertCircle, color: "text-orange-600 bg-orange-50" },
    error: { icon: WifiOff, color: "text-red-600 bg-red-50" },
  };
  const activityLog = Array.isArray(activityLogRaw)
    ? activityLogRaw.map((log, i) => {
      let msg = log?.message ?? "";

      // If BE message includes class ID, try replacing with course code.
      // Example: "Admin đã phân công giảng viên vào lớp (ID: 3)"
      if (typeof msg === "string" && msg.includes("vào lớp") && /\(ID:\s*\d+\)/.test(msg)) {
        const payloadCourseCode =
          log?.payload?.courseCode ??
          log?.payload?.code ??
          log?.payload?.course?.code ??
          null;

        const idMatch = /\(ID:\s*(\d+)\)/.exec(msg);
        const courseId = idMatch?.[1];
        const mappedCourseCode = courseCodeById[String(courseId)] || null;

        const replacement = payloadCourseCode || mappedCourseCode;
        if (replacement) {
          msg = msg.replace(/\(ID:\s*\d+\)/, `(${replacement})`);
        }
      }

      return {
        ...log,
        ...(ICON_MAP[log.type] || ICON_MAP.info),
        id: i,
        msg,
        time: log.time || new Date(log.timestamp).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
      };
    })
    : [];

  // Normalize team rankings
  const teamRankings = Array.isArray(teamRankingsRaw) ? teamRankingsRaw : [];
  const inactiveTeams = Array.isArray(inactiveTeamsRaw) ? inactiveTeamsRaw : [];


  const safeSemesters = Array.isArray(semesters) ? semesters : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const isLoading = loadingStats || loadingCourses || loadingSems || loadingSubs || loadingProjects;

  const stats = {
    semesters: safeSemesters.length,
    subjects: dashboardStats?.totalSubjects || safeSubjects.length,
    courses: dashboardStats?.totalCourses || coursesData?.totalCount || 0,
    lecturers: dashboardStats?.totalLecturers || 0,
    students: dashboardStats?.totalStudents || 0,
    projects: dashboardStats?.totalProjects || projectsData?.totalCount || 0,
  };

  const activeSemesters = safeSemesters.filter((s) => s?.status === "ACTIVE").length;

  const getSemesterName = (id) => {
    if (!id) return "N/A";
    const found = safeSemesters.find((s) => String(s?.id) === String(id));
    return found?.name || "N/A";
  };

  const getSubjectName = (id) => {
    if (!id) return "N/A";
    const found = safeSubjects.find((s) => String(s?.id) === String(id));
    return found?.code || "N/A";
  };

  return (
    <div className="space-y-7">

      {/* ── Breadcrumb ─────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
        <span className="text-teal-700 font-semibold">Admin</span>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-semibold">Tổng quan hệ thống</span>
      </nav>

      {/* ── A. Hero Metrics (6 cards) ─────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <HeroCard icon={<CalendarDays size={20} />} color="bg-blue-500" label="Học kỳ" value={stats.semesters} sub={`${activeSemesters} đang mở`} />
        <HeroCard icon={<Library size={20} />} color="bg-indigo-500" label="Môn học" value={stats.subjects} />
        <HeroCard icon={<BookOpen size={20} />} color="bg-blue-600" label="Lớp học phần" value={stats.courses} />
        <HeroCard icon={<UserCog size={20} />} color="bg-purple-500" label="Giảng viên" value={stats.lecturers} />
        <HeroCard icon={<GraduationCap size={20} />} color="bg-teal-500" label="Sinh viên" value={stats.students} />
        <HeroCard icon={<FolderKanban size={20} />} color="bg-orange-400" label="Nhóm dự án" value={stats.projects} sub={integrationStats ? `${integrationStats.repoConnected ?? 0} đã kết nối` : undefined} />
      </div>

      {/* ── B. Activity + Quick Actions (2-col) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent activity */}
        <Card className="lg:col-span-3 border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <Activity size={15} className="text-teal-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">Hoạt động hệ thống</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activityLog.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-gray-400 text-sm">Không có hoạt động nào gần đây</div>
            ) : activityLog.map((act) => (
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

        {/* Quick Actions */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Plus size={15} className="text-indigo-600" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">Thao tác nhanh</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 gap-3">
            {[
              { icon: CalendarDays, label: "Tạo học kỳ", to: "/admin/semesters", color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" },
              { icon: Library, label: "Tạo môn học", to: "/admin/subjects", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100" },
              { icon: BookOpen, label: "Tạo lớp học phần", to: "/admin/courses", color: "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-100" },
              { icon: UserCog, label: "Phân công GV", to: "/admin/lecturer-assignment", color: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100" },
              { icon: Users, label: "Quản lý người dùng", to: "/admin/users", color: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100" },
              { icon: TrendingUp, label: "Xem báo cáo", to: "/admin/reports", color: "bg-green-50 text-green-700 hover:bg-green-100 border-green-100" },
            ].map(({ icon: Icon, label, to, color }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center text-xs font-semibold transition-all hover:shadow-sm ${color}`}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-sm">
                  <Icon size={16} />
                </div>
                <span className="leading-tight">{label}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── D. Recent Courses Table (REAL API) ── */}
      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-gray-800">Lớp học phần gần đây</CardTitle>
              {!isLoading && !courseError ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 font-medium">
                  Live API
                </span>
              ) : courseError ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 font-medium flex items-center gap-1">
                  <WifiOff size={9} /> Kết nối lỗi
                </span>
              ) : null}
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => navigate("/admin/courses")}
              className="rounded-full text-xs h-8 px-4 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Xem tất cả
            </Button>
          </div>
        </CardHeader>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Tên lớp</div>
          <div className="col-span-3 hidden md:block text-center">Môn / Học kỳ</div>
          <div className="col-span-2 text-center">Sĩ số</div>
          <div className="col-span-3 text-center">Trạng thái</div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-teal-600" />
            </div>
          ) : recentCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <BookOpen size={28} className="opacity-30" />
              <p className="text-sm">Chưa có lớp học phần nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentCourses.map((course, i) => {
                // Course từ API đã có subject/semester object — dùng trực tiếp
                const subjectCode = course.subject?.code ?? getSubjectName(course.subjectId);
                const semesterName = course.semester?.name ?? getSemesterName(course.semesterId);

                return (
                  <div key={course?.id ?? i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-medium w-5 shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{course?.code ?? "N/A"}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[140px]">{course?.name ?? `Lớp (ID: ${course?.id ?? "N/A"})`}</p>
                      </div>
                    </div>
                    <div className="col-span-3 hidden md:flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {subjectCode}
                      </span>
                      <span className="text-[11px] text-gray-500">{semesterName}</span>
                    </div>
                    <div className="col-span-2 text-center text-sm font-semibold text-gray-700">
                      {course?.currentStudents ?? 0}
                      <span className="text-gray-400 text-xs font-normal">/{course?.maxStudents ?? "N/A"}</span>
                    </div>
                    <div className="col-span-3 flex items-center justify-center">
                      <CourseStatusBadge status={course?.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── E. 2-col: Team Rankings + Inactive Teams ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Team Rankings */}
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <TrendingUp size={15} className="text-amber-500" />
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">Bảng xếp hạng Nhóm</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {teamRankings.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-gray-400 text-sm">Chưa có dữ liệu xếp hạng</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {teamRankings.map((team, i) => (
                  <div key={team.projectId ?? team.id ?? i} className="flex items-center gap-3 px-5 py-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      i === 0 ? 'bg-amber-400 text-white' :
                      i === 1 ? 'bg-gray-300 text-gray-700' :
                      i === 2 ? 'bg-orange-300 text-white' :
                      'bg-gray-100 text-gray-500'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{team.projectName ?? team.name ?? `Nhóm ${i+1}`}</p>
                      <p className="text-xs text-gray-400">{team.courseCode ?? team.courseName ?? ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-teal-600">{team.totalCommits ?? team.commits ?? 0}</p>
                      <p className="text-[10px] text-gray-400">commits</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inactive Teams Warning */}
        <Card className={`border shadow-sm rounded-[24px] overflow-hidden ${
          inactiveTeams.length > 0 ? 'border-red-100 bg-red-50/20' : 'border-green-100 bg-green-50/20'
        }`}>
          <CardHeader className="border-b border-gray-50/50 pb-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                inactiveTeams.length > 0 ? 'bg-red-50' : 'bg-green-50'
              }`}>
                <AlertCircle size={15} className={inactiveTeams.length > 0 ? 'text-red-500' : 'text-green-500'} />
              </div>
              <CardTitle className="text-base font-semibold text-gray-800">Nhóm ít hoạt động</CardTitle>
              {inactiveTeams.length > 0 && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full">{inactiveTeams.length} nhóm</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {inactiveTeams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCircle size={28} className="text-green-400" />
                <p className="text-sm text-gray-500 font-medium">Tất cả nhóm đang hoạt động tốt!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {inactiveTeams.slice(0, 5).map((team, i) => (
                  <div key={team.projectId ?? team.id ?? i} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{team.projectName ?? team.name ?? `Nhóm ${i+1}`}</p>
                      <p className="text-xs text-gray-400">{team.courseCode ?? team.lastActivity ?? 'Chưa có hoạt động'}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full">
                      {team.daysSinceLastCommit != null ? `${team.daysSinceLastCommit}d` : 'Bất hoạt'}
                    </span>
                  </div>
                ))}
                {inactiveTeams.length > 5 && (
                  <div className="px-5 py-2.5 text-xs text-gray-400 text-center">+{inactiveTeams.length - 5} nhóm khác</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────── */

function HeroCard({ icon, color, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all duration-200 group">
      <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800 leading-none mt-0.5">{value}</h3>
        {sub && <p className="text-[10px] text-green-600 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function CourseStatusBadge({ status }) {
  const map = {
    ACTIVE: "bg-green-50 text-green-700",
    UPCOMING: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-gray-100 text-gray-500",
    CLOSED: "bg-gray-100 text-gray-500",
  };
  const label = { ACTIVE: "Đang mở", UPCOMING: "Sắp mở", COMPLETED: "Đã kết thúc", CLOSED: "Đã đóng" };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${map[status] ?? map.CLOSED}`}>
      {label[status] ?? status ?? "—"}
    </span>
  );
}
