import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  BookOpen,
  Search,
  GitBranch,
  AlertTriangle,
  ChevronRight,
  Monitor
} from "lucide-react";

import { Card, CardContent } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { InputField } from "../../components/shared/FormFields.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

import { useLecturerAnalyticsCourses } from "../../features/dashboard/hooks/useDashboard.js";

export default function MyCourses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: analyticsCourses = [], isLoading } = useLecturerAnalyticsCourses();
  
  const courses = Array.isArray(analyticsCourses) ? analyticsCourses : (analyticsCourses?.items || []);

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const keyword = search.toLowerCase();
      return (
        c.code?.toLowerCase().includes(keyword) ||
        c.name?.toLowerCase().includes(keyword) ||
        (c.subject?.name || c.subjectName)?.toLowerCase().includes(keyword)
      );
    });
  }, [courses, search]);

  const totalGroups = courses.reduce((a, c) => a + (c.projects?.length || 0), 0);
  const totalStudents = courses.reduce((a, c) => a + (c.currentStudents || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Lớp của tôi"
        subtitle="Danh sách các lớp học phần bạn đang trực tiếp giảng dạy và quản lý."
        breadcrumb={["Giảng viên", "Lớp học"]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Tổng lớp" value={courses.length} icon={GraduationCap} variant="info" />
        <StatsCard label="Tổng nhóm" value={totalGroups} icon={BookOpen} variant="indigo" />
        <StatsCard label="Tổng sinh viên" value={totalStudents} icon={Users} variant="success" />
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30">
          <InputField 
            placeholder="Tìm kiếm lớp học, mã môn..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            icon={Search}
            className="max-w-md bg-white"
          />
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"/>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                <GraduationCap size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm font-medium">{search ? "Không tìm thấy lớp học phù hợp" : "Bạn chưa được giao lớp nào"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(course => (
                 <CourseItem key={course.id} course={course} onNavigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseItem({ course, onNavigate }) {
  const groupCount = course.projects?.length || 0;
  const activeTeams = course.projects?.filter(p => p.githubUrl)?.length || 0;
  const jiraConnected = course.projects?.filter(p => p.jiraProjectCode)?.length || 0;
  const alerts = course.alertsCount || 0;
  const progress = Math.min(100, Math.round((activeTeams / (groupCount || 1)) * 100));

  let status = "ACTIVE";
  if (activeTeams === 0 && groupCount > 0) status = "NO REPO";
  else if (activeTeams < groupCount / 2) status = "LOW";
  if (course.status === "COMPLETED") status = "ARCHIVED";

  return (
    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white hover:shadow-md transition-all group">
      <div className="h-1 bg-teal-500" />
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
           <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <GraduationCap size={20} />
           </div>
           <StatusBadge 
              status={status === 'ACTIVE' ? 'success' : status === 'ARCHIVED' ? 'default' : 'warning'} 
              label={status} 
           />
        </div>

        <div>
           <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{course.subject?.code || course.subjectCode}</p>
           <h3 className="font-black text-gray-800 text-lg leading-tight mt-1">{course.code}</h3>
           <p className="text-xs text-gray-400 font-bold uppercase mt-1 line-clamp-1">{course.name || course.subject?.name}</p>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
           <span className="flex items-center gap-1.5"><Users size={12}/> {course.currentStudents || 0} SV</span>
           <span className="flex items-center gap-1.5"><BookOpen size={12}/> {groupCount} Nhóm</span>
        </div>

        <div className="space-y-1.5">
           <div className="flex justify-between text-[10px] font-black uppercase">
              <span className="text-gray-400">Tiến độ dự án</span>
              <span className="text-teal-600">{progress}%</span>
           </div>
           <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500" style={{width: `${progress}%`}} />
           </div>
        </div>

        {alerts > 0 && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase">
             <AlertTriangle size={12} />
             {alerts} cảnh báo được phát hiện
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
           <Button 
            className="bg-gray-50 hover:bg-teal-600 hover:text-white text-gray-400 border-0 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest transition-all"
            onClick={() => onNavigate(`/lecturer/course/${course.id}/manage-groups`)}
           >
              Quản lý
           </Button>
           <Button 
            className="bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-400 border-0 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest transition-all"
            onClick={() => onNavigate(`/lecturer/course/${course.id}/analytics`)}
           >
              Thống kê
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}