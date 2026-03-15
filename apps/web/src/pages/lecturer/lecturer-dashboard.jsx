import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  GitBranch, 
  BookOpen, 
  CheckCircle, 
  Activity, 
  FileText,
  Clock,
  Eye,
  Bell,
  AlertTriangle
} from "lucide-react";

// Components
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { LecturerStats } from "../../features/dashboard/components/LecturerStats.jsx";
import { LecturerFilters } from "../../features/dashboard/components/LecturerFilters.jsx";

// Hooks
import { useAuth } from "../../context/AuthContext.jsx";
import { 
  useGetSemesters, 
  useGetSubjects 
} from "../../features/system/hooks/useSystem.js";
import { 
  useGetCourses, 
  useGetCourseById 
} from "../../features/courses/hooks/useCourses.js";
import { 
  useLecturerWorkload,
} from "../../features/dashboard/hooks/useDashboard.js";

const MOCK_ACTIVITY = [
  { id: 1, icon: GitBranch, color: "text-teal-600 bg-teal-50", msg: "Nhóm Alpha đã submit GitHub repo", time: "5 phút trước" },
  { id: 2, icon: BookOpen, color: "text-blue-600 bg-blue-50", msg: "Nhóm Beta đã kết nối Jira project", time: "1 giờ trước" },
];

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user } = useAuth();

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: workload } = useLecturerWorkload(user?.id);
  const { data: subjectsData = { items: [] } } = useGetSubjects();
  const { data: coursesData = { items: [] } } = useGetCourses();
  const { data: course } = useGetCourseById(selectedCourse);

  const subjects = subjectsData?.items || [];
  const courses = coursesData?.items || [];
  const groups = course?.groups || [];

  const stats = {
    courses: workload?.coursesCount || 0,
    students: workload?.studentsCount || 0,
    github: groups.filter(g => g.integration?.githubStatus === "APPROVED").length,
    alerts: groups.filter(g => g.integration?.githubStatus !== "APPROVED").length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Dashboard Giảng viên"
        subtitle={`Chào mừng trở lại, ${user?.name || 'Giảng viên'}!`}
        breadcrumb={["Giảng viên", "Hệ thống", "Tổng quan"]}
        actions={[
          <Button key="notif" variant="outline" className="rounded-full w-10 h-10 p-0 border-gray-200">
            <Bell size={18} />
          </Button>
        ]}
      />

      <LecturerStats stats={stats} />

      <LecturerFilters 
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        filter={filter}
        setFilter={setFilter}
        subjects={subjects}
        courses={courses}
        onManageGroups={() => navigate(`/lecturer/course/${selectedCourse}/manage-groups`)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <Activity size={15} className="text-teal-600" />
              </div>
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Hoạt động gần đây</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {MOCK_ACTIVITY.map(act => (
              <div key={act.id} className="flex items-start gap-3 px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
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

        <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
          <CardHeader className="border-b border-gray-50 py-5 px-6">
             <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle size={15} className="text-amber-600" />
              </div>
              <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Cần lưu ý</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-xs font-bold text-amber-800">12 nhóm chưa cập nhật GitHub</p>
                <p className="text-[10px] text-amber-600 mt-1 font-medium">Hạn chót: Iteration 1 - 2 ngày nữa</p>
              </div>
              <Button 
                variant="ghost" 
                className="w-full h-11 rounded-xl text-xs font-bold text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                onClick={() => navigate("/lecturer/alerts")}
              >
                Xem tất cả cảnh báo →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
