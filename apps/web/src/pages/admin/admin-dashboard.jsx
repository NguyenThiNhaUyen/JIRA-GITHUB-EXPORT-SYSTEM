// Admin Dashboard — Enterprise SaaS Governance
// Courses section: REAL API | Stats: mock (pending BE endpoints)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import db from "../../mock/db.js";
import { useToast } from "../../components/ui/toast.jsx";
import { getCourses } from "../../features/courses/api/courseApi.js";
import {
  BookOpen, Library, CalendarDays, Users, GraduationCap,
  FolderKanban, TrendingUp, UserCog, Plus, ChevronRight,
  Activity, CheckCircle, AlertCircle, Clock, WifiOff
} from "lucide-react";

// Mock recent system activity (static — không cần API)
const SYSTEM_ACTIVITY = [
  { icon: Users, color: "text-blue-600 bg-blue-50", msg: "Sinh viên mới đăng ký lớp SE001", time: "5 phút trước" },
  { icon: UserCog, color: "text-teal-600 bg-teal-50", msg: "GV. Nguyễn được phân công SE002", time: "30 phút trước" },
  { icon: BookOpen, color: "text-indigo-600 bg-indigo-50", msg: "Lớp học phần SE003-K22 được tạo mới", time: "2 giờ trước" },
  { icon: CheckCircle, color: "text-green-600 bg-green-50", msg: "Học kỳ 2024-2 đã được kích hoạt", time: "Hôm qua" },
  { icon: AlertCircle, color: "text-orange-600 bg-orange-50", msg: "5 nhóm chưa submit GitHub link", time: "Hôm qua" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [courseError, setCourseError] = useState(null);
  const [stats, setStats] = useState({ semesters: 0, subjects: 0, courses: 0, lecturers: 0, students: 0, projects: 0 });
  const [recentCourses, setRecentCourses] = useState([]);

  // Helper cho stats từ mock (học kỳ, môn học, giảng viên, sinh viên)
  // TODO: thay bằng real API khi BE có endpoint GET /api/admin/stats
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setCourseError(null);

    // ── 1. Stats từ mock (học kỳ / môn học / GV / SV) ────────────
    // TODO: Replace with real API when /api/admin/stats endpoint exists
    const semestersData = db.findMany("semesters");
    const subjectsData = db.findMany("subjects");
    const lecturersData = db.findMany("users.lecturers");
    const studentsData = db.findMany("users.students");
    const groups = db.findMany("groups");
    setSemesters(semestersData);
    setSubjects(subjectsData);

    // ── 2. Courses từ REAL API ─────────────────────────────────────
    let apiCourses = [];
    try {
      const result = await getCourses({ page: 1, pageSize: 6 });
      // result = { items: FECourse[], totalCount, page, pageSize }
      apiCourses = result.items ?? [];
      setRecentCourses(apiCourses);
      setStats({
        semesters: semestersData.length,
        subjects: subjectsData.length,
        courses: result.totalCount ?? apiCourses.length,  // dùng totalCount từ API
        lecturers: lecturersData.length,
        students: studentsData.length,
        projects: groups.length,
      });
    } catch (err) {
      console.warn("[AdminDashboard] getCourses failed:", err);
      // Fallback về mock nếu API lỗi (BE cold start, network...)
      const mockCourses = db.findMany("courses");
      apiCourses = mockCourses;
      setRecentCourses(mockCourses.slice(0, 6));
      setStats({
        semesters: semestersData.length,
        subjects: subjectsData.length,
        courses: mockCourses.length,
        lecturers: lecturersData.length,
        students: studentsData.length,
        projects: groups.length,
      });
      // Chỉ hiện lỗi khi không phải cold start timeout
      const msg = err?.message ?? "";
      if (!msg.includes("503") && !msg.includes("timeout")) {
        setCourseError("Không thể tải dữ liệu lớp học từ server");
        showError("Không thể tải dữ liệu lớp học");
      } else {
        setCourseError("server_cold"); // Render đang cold start
      }
    }

    setLoading(false);
  };

  const getSemesterName = (id) => {
    // Thử từ data semester đã có (có thể là object từ API hoặc mock)
    if (!id) return "N/A";
    const found = semesters.find(s => String(s.id) === String(id));
    return found?.code ?? found?.name ?? "N/A";
  };

  const getSubjectName = (id) => {
    if (!id) return "N/A";
    // Nếu course từ API đã có subject object, hiển thị trực tiếp
    // Helper này dùng cho course mock fallback
    const found = subjects.find(s => String(s.id) === String(id));
    return found?.code ?? found?.name ?? "N/A";
  };

  const activeSemesters = semesters.filter(s => s.status === "ACTIVE").length;

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
            {SYSTEM_ACTIVITY.map((act, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
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
              {/* Badge cho biết nguồn dữ liệu */}
              {courseError === "server_cold" ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 font-medium flex items-center gap-1">
                  <WifiOff size={9} /> Mock data
                </span>
              ) : !courseError ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 font-medium">
                  Live API
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
          {loading ? (
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
