import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  Clock,
  Plus,
  CalendarDays,
  Library,
  BookOpen,
  Users,
  TrendingUp,
  UserCog,
  WifiOff,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

// Components UI
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { AdminStats } from "../../features/dashboard/components/AdminStats.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";

// Hooks
import { useAuth } from "../../context/AuthContext.jsx";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";
import { useGetSemesters, useGetSubjects } from "../../features/system/hooks/useSystem.js";
import { useGetUsers } from "../../features/users/hooks/useUsers.js";
import {
  useAdminStats,
  useIntegrationStats,
  useActivityLog,
} from "../../features/dashboard/hooks/useDashboard.js";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: coursesData, isLoading: loadingCourses, error: courseError } = useGetCourses({ page: 1, pageSize: 6 });
  const { data: semesters = [], isLoading: loadingSems } = useGetSemesters();
  const { data: subjects = [], isLoading: loadingSubs } = useGetSubjects();
  const { data: lecturersRaw = [], isLoading: loadingLects } = useGetUsers("LECTURER");
  const { data: studentsRaw = [], isLoading: loadingStus } = useGetUsers("STUDENT");

  const { data: adminStatsData } = useAdminStats();
  const { data: integrationStatsData } = useIntegrationStats();
  const { data: activityLogData = [] } = useActivityLog(5);

  const stats = {
    semesters: adminStatsData?.semesters || semesters.length,
    subjects: adminStatsData?.subjects || subjects.length,
    courses: adminStatsData?.courses || coursesData?.totalCount || 0,
    lecturers: adminStatsData?.lecturers || lecturersRaw.length,
    students: adminStatsData?.students || studentsRaw.length,
    projects: adminStatsData?.projects || 0
  };

  const integrationStats = {
    repoConnected: integrationStatsData?.repoConnected || 0,
    repoMissing: integrationStatsData?.repoMissing || 0,
    jiraConnected: integrationStatsData?.jiraConnected || 0,
    syncErrors: integrationStatsData?.syncErrors || 0,
    reportsExported: integrationStatsData?.reportsExported || 0,
  };

  const getLogIcon = (type) => {
    switch (String(type).toLowerCase()) {
      case "github": return { icon: GitBranch, color: "text-teal-600 bg-teal-50" };
      case "jira": return { icon: BookOpen, color: "text-blue-600 bg-blue-50" };
      case "success": return { icon: CheckCircle, color: "text-green-600 bg-green-50" };
      case "warning": return { icon: AlertTriangle, color: "text-amber-600 bg-amber-50" };
      case "error": return { icon: AlertTriangle, color: "text-red-600 bg-red-50" };
      default: return { icon: Info, color: "text-slate-600 bg-slate-50" };
    }
  };

  const activityLog = activityLogData.length > 0 ? activityLogData.map(a => {
    const { icon, color } = getLogIcon(a.type);
    return {
      icon,
      color,
      msg: a.message || a.msg,
      time: a.time || "Vừa xong"
    };
  }) : [
    { icon: Users, color: "text-blue-600 bg-blue-50", msg: "Sinh viên mới đăng ký lớp học", time: "5 phút trước" },
    { icon: UserCog, color: "text-teal-600 bg-teal-50", msg: "Giảng viên mới được phân công môn học", time: "30 phút trước" },
    { icon: BookOpen, color: "text-indigo-600 bg-indigo-50", msg: "Lớp học phần mới được tạo", time: "2 giờ trước" },
  ];

  const recentCourses = coursesData?.items || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Quản trị Hệ thống"
        subtitle="Tổng quan toàn bộ hoạt động, tài khoản và tích hợp trên hệ thống."
        breadcrumb={["Admin", "Tổng quan"]}
      />

      <AdminStats 
        stats={stats} 
        integrationStats={integrationStats} 
        activeSemesters={semesters.filter(s => s.status === "ACTIVE").length} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Activity Log */}
        <Card className="lg:col-span-3 border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <Activity size={15} className="text-teal-600" />
              </div>
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Hoạt động hệ thống</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activityLogData.length === 0 && (loadingCourses || loadingSems) ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-4 px-6 py-4 border-b border-gray-50 last:border-0">
                  <Skeleton className="w-9 h-9 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-3 w-1/4 rounded-lg" />
                  </div>
                </div>
              ))
            ) : activityLog.map((act, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0 animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i*100}ms` }}>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${act.color}`}>
                  <act.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 leading-snug">{act.msg}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-bold">
                    <Clock size={12} /> {act.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Plus size={15} className="text-indigo-600" />
              </div>
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Thao tác nhanh</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: CalendarDays, label: "Học kỳ", to: "/admin/semesters" },
                { icon: Library, label: "Môn học", to: "/admin/subjects" },
                { icon: BookOpen, label: "Lớp học phần", to: "/admin/courses" },
                { icon: UserCog, label: "Phân giảng", to: "/admin/lecturer-assignment" },
                { icon: Users, label: "Người dùng", to: "/admin/users" },
                { icon: TrendingUp, label: "Báo cáo", to: "/admin/reports" }
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(action.to)}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-teal-500 hover:shadow-lg hover:shadow-teal-100 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-teal-600 shadow-sm transition-colors">
                    <action.icon size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses Table */}
      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 py-5 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOpen size={15} className="text-blue-600" />
              </div>
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Lớp học phần gần đây</CardTitle>
              {courseError && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 font-bold uppercase tracking-widest flex items-center gap-1">
                  <WifiOff size={10} /> Sync Error
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/courses")}
              className="rounded-xl border-gray-200 text-[10px] font-black uppercase tracking-widest px-4 h-9"
            >
              Xem tất cả
            </Button>
          </div>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Mã lớp</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Môn / Học kỳ</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Sĩ số</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingCourses ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-5"><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-32" /></div></td>
                    <td className="px-8 py-5"><div className="flex flex-col items-center gap-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-3 w-20" /></div></td>
                    <td className="px-8 py-5 text-center"><Skeleton className="h-4 w-10 mx-auto" /></td>
                    <td className="px-8 py-5 text-center"><Skeleton className="h-6 w-20 rounded-lg mx-auto" /></td>
                  </tr>
                ))
              ) : recentCourses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                    Chưa có lớp học được tạo
                  </td>
                </tr>
              ) : (
                recentCourses.map((course, idx) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition-colors animate-in fade-in duration-500" style={{ animationDelay: `${idx*50}ms` }}>
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-black text-gray-800 text-sm tracking-tight">{course.code}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[200px]">{course.name}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                          {course.subject?.code || "N/A"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{course.semester?.name || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <p className="text-sm font-black text-gray-700">
                        {course.currentStudents || 0}
                        <span className="text-gray-300 text-xs font-bold">/{course.maxStudents || 40}</span>
                      </p>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <CourseStatusBadge status={course.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CourseStatusBadge({ status }) {
  const map = {
    ACTIVE: "bg-green-50 text-green-700 border-green-100",
    UPCOMING: "bg-blue-50 text-blue-700 border-blue-100",
    COMPLETED: "bg-gray-100 text-gray-500 border-gray-200",
    CLOSED: "bg-red-50 text-red-600 border-red-100",
  };
  const label = { ACTIVE: "Đang mở", UPCOMING: "Sắp mở", COMPLETED: "Hoàn thành", CLOSED: "Đã đóng" };
  return (
    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {label[status] ?? status}
    </span>
  );
}
