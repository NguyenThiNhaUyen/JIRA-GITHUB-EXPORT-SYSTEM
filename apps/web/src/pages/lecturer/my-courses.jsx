import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  BookOpen,
  Search,
  AlertTriangle,
  Settings2,
  BarChart3
} from "lucide-react";

import { Card, CardContent } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { InputField } from "../../components/shared/FormFields.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

// Feature Hooks
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";

export default function MyCourses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  
  // Data Fetching - Backend automatically filters by lecturer based on token role
  const { data: coursesData = { items: [] }, isLoading } = useGetCourses({ pageSize: 100 });
  const courses = coursesData.items || [];

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const keyword = search.toLowerCase();
      return (
        c.code?.toLowerCase().includes(keyword) ||
        c.name?.toLowerCase().includes(keyword) ||
        (c.subjectName || c.subject?.name)?.toLowerCase().includes(keyword)
      );
    });
  }, [courses, search]);

  const totalGroups = courses.reduce((a, c) => a + (c.projects?.length || 0), 0);
  const totalStudents = courses.reduce((a, c) => a + (c.currentStudents || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Lớp của tôi"
        subtitle="Quản lý danh sách các lớp học phần bạn đang trực tiếp giảng dạy."
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
            className="max-w-md bg-white border border-gray-100"
          />
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"/>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                <GraduationCap size={24} className="text-gray-300" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{search ? "Không tìm thấy lớp học hợp lệ" : "Bạn chưa được phân công lớp nào"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(course => (
                 <CourseCard key={course.id} course={course} onNavigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, onNavigate }) {
  const groupCount = course.projects?.length || 0;
  const progress = course.progress || 0;
  const alerts = course.alertsCount || 0;

  return (
    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white hover:shadow-xl hover:shadow-teal-100/20 transition-all group border-t-4 border-t-teal-500">
      <CardContent className="p-8 space-y-6">
        <div className="flex justify-between items-start">
           <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm">
              <GraduationCap size={22} />
           </div>
           <StatusBadge 
              status={course.status === 'COMPLETED' ? 'default' : 'success'} 
              label={course.status || 'ACTIVE'} 
           />
        </div>

        <div>
           <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{course.subjectCode || "N/A"}</p>
           <h3 className="font-black text-gray-800 text-lg leading-tight mt-1.5">{course.code}</h3>
           <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 line-clamp-1 h-4">{course.name || course.subjectName}</p>
        </div>

        <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-y border-gray-50 py-4">
           <span className="flex items-center gap-1.5"><Users size={12}/> {course.currentStudents || 0} SV</span>
           <span className="flex items-center gap-1.5"><BookOpen size={12}/> {groupCount} NHÓM</span>
        </div>

        <div className="space-y-2">
           <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
              <span className="text-gray-400">Tiến độ giai đoạn</span>
              <span className="text-teal-600">{progress}%</span>
           </div>
           <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)] transition-all" style={{width: `${progress}%`}} />
           </div>
        </div>

        {alerts > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 text-orange-600 text-[9px] font-black uppercase border border-orange-100">
             <AlertTriangle size={12} />
             {alerts} cảnh báo cần xử lý
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
           <Button 
            className="bg-gray-50 hover:bg-teal-600 hover:text-white text-gray-400 border-0 rounded-2xl h-11 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
            onClick={() => onNavigate(`/lecturer/course/${course.id}/manage-groups`)}
           >
              <Settings2 size={14} className="mr-2" /> Quản lý
           </Button>
           <Button 
            className="bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-400 border-0 rounded-2xl h-11 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
            onClick={() => onNavigate(`/lecturer/course/${course.id}/analytics`)}
           >
              <BarChart3 size={14} className="mr-2" /> Thống kê
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
