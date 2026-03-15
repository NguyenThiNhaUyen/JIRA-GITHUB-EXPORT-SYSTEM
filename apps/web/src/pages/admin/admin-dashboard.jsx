import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  Activity, 
  Clock,
  Plus,
  CalendarDays,
  Library,
  BookOpen,
  Users,
  FolderKanban,
  TrendingUp
} from "lucide-react";

// Components
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { AdminStats } from "../../features/dashboard/components/AdminStats.jsx";

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

  const { data: coursesData } = useGetCourses({ page: 1, pageSize: 6 });
  const { data: semesters = [] } = useGetSemesters();
  const { data: subjects = [] } = useGetSubjects();
  const { data: lecturersRaw = [] } = useGetUsers("LECTURER");
  const { data: studentsRaw = [] } = useGetUsers("STUDENT");

  const { data: adminStats } = useAdminStats();
  const { data: integrationStatsData } = useIntegrationStats();
  const { data: activityLogData = [] } = useActivityLog(5);

  const stats = {
    semesters: adminStats?.totalSubjects !== undefined ? adminStats.totalSubjects : semesters.length,
    subjects: adminStats?.totalSubjects || subjects.length,
    courses: adminStats?.totalCourses || coursesData?.totalCount || 0,
    lecturers: lecturersRaw.length,
    students: adminStats?.totalUsers || studentsRaw.length,
    projects: adminStats?.totalProjects || 0
  };

  const integrationStats = {
    repoConnected: integrationStatsData?.repoConnected || 0,
    repoMissing: integrationStatsData?.repoMissing || 0,
    jiraConnected: integrationStatsData?.jiraConnected || 0,
    syncErrors: integrationStatsData?.syncErrors || 0,
    reportsExported: integrationStatsData?.reportsExported || 0,
  };

  const activityLog = activityLogData.map(a => ({
    icon: Activity,
    color: "text-teal-600 bg-teal-50",
    msg: a.message || a.msg,
    time: a.time || "Vừa xong"
  }));

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Log */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <Activity size={15} className="text-teal-600" />
              </div>
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Hoạt động hệ thống</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activityLog.map((act, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
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
        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
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
                { icon: BookOpen, label: "Lớp học", to: "/admin/courses" },
                { icon: Users, label: "Sinh viên", to: "/admin/users" },
                { icon: FolderKanban, label: "Nhóm", to: "/admin/groups" },
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
    </div>
  );
}