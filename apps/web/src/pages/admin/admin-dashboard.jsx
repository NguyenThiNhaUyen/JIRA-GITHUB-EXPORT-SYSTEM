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
import { useGetSemesters, useGetSubjects } from "../../features/system/hooks/useSystem.js";
import { useGetUsers } from "../../features/users/hooks/useUsers.js";
import { useLecturerActivityLogs } from "../../hooks/use-api.js";
import { GitBranch, FileText } from "lucide-react";


/* ─── Static icon definitions ────────────────── */
const getActivityIconInfo = (type) => {
    switch (type) {
        case 'GITHUB_SYNC': return { icon: GitBranch, color: "text-teal-600 bg-teal-50" };
        case 'JIRA_SYNC': return { icon: BookOpen, color: "text-blue-600 bg-blue-50" };
        case 'SRS_SUBMIT': return { icon: FileText, color: "text-indigo-600 bg-indigo-50" };
        case 'INTEGRATION_APPROVED': return { icon: CheckCircle, color: "text-green-600 bg-green-50" };
        case 'NEW_USER': return { icon: Users, color: "text-blue-600 bg-blue-50" };
        case 'NEW_COURSE': return { icon: BookOpen, color: "text-indigo-600 bg-indigo-50" };
        case 'ALERT': return { icon: AlertCircle, color: "text-orange-600 bg-orange-50" };
        default: return { icon: CheckCircle, color: "text-gray-600 bg-gray-50" };
    }
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Data Fetching
  const { data: coursesData, isLoading: loadingCourses, error: courseError } = useGetCourses({ page: 1, pageSize: 6 });
  const { data: semesters = [], isLoading: loadingSems } = useGetSemesters();
  const { data: subjects = [], isLoading: loadingSubs } = useGetSubjects();
  const { data: projectsData, isLoading: loadingProjects } = useGetProjects({ pageSize: 1 });
  const { data: activityLogsData, isLoading: loadingLogs } = useLecturerActivityLogs(5); // Admin can see general logs as well

  // For counts, we could have a stats API, but for now fetch summaries
  const { data: lecturersRaw = [], isLoading: loadingLects } = useGetUsers("LECTURER");
  const { data: studentsRaw = [], isLoading: loadingStus } = useGetUsers("STUDENT");

  const recentCourses = coursesData?.items || [];
  const isLoading = loadingCourses || loadingSems || loadingSubs || loadingLects || loadingStus || loadingProjects;
  
  const activities = (activityLogsData?.items) || [];

  const stats = {
    semesters: semesters.length,
    subjects: subjects.length,
    courses: coursesData?.totalCount || recentCourses.length,
    lecturers: lecturersRaw.length,
    students: studentsRaw.length,
    projects: projectsData?.totalCount || 0,
  };

  const activeSemesters = semesters.filter(s => s.status === "ACTIVE").length;

  const getSemesterName = (id) => {
    if (!id) return "N/A";
    const found = semesters.find(s => String(s.id) === String(id));
    return found?.name || "N/A";
  };

  const getSubjectName = (id) => {
    if (!id) return "N/A";
    const found = subjects.find(s => String(s.id) === String(id));
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
        <HeroCard icon={<FolderKanban size={20} />} color="bg-orange-400" label="Nhóm dự án" value={stats.projects} />
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
             {loadingLogs ? (
                 <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
                 </div>
             ) : activities.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Activity size={28} className="text-gray-300" />
                    <p className="text-sm text-gray-400">Chưa có hoạt động nào được ghi nhận</p>
                 </div>
             ) : (
                activities.map(act => {
                    const { icon: ActIcon, color } = getActivityIconInfo(act.type);
                    return (
                    <div key={act.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                        <ActIcon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-snug">{act.msg || act.description || 'Hoạt động ẩn danh'}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock size={10} />{act.time || new Date(act.timestamp || act.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                        </div>
                    </div>
                )})
             )}
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
                  <div key={course.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                      <span className="text-xs text-gray-400 font-medium w-5 shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{course.code}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[140px]">{course.name}</p>
                      </div>
                    </div>
                    <div className="col-span-3 hidden md:flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {subjectCode}
                      </span>
                      <span className="text-[11px] text-gray-500">{semesterName}</span>
                    </div>
                    <div className="col-span-2 text-center text-sm font-semibold text-gray-700">
                      {course.currentStudents}
                      <span className="text-gray-400 text-xs font-normal">/{course.maxStudents}</span>
                    </div>
                    <div className="col-span-3 flex items-center justify-center">
                      <CourseStatusBadge status={course.status} />
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
