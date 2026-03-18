import { useState, useMemo } from "react";
import { 
  Users, 
  BookOpen, 
  Search, 
  TrendingUp, 
  BarChart3,
  UserCheck,
  Award,
  Filter
} from "lucide-react";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { PageHeader } from "@/components/shared/PageHeader.jsx";
import { StatsCard } from "@/components/shared/StatsCard.jsx";
import { InputField, SelectField } from "@/components/shared/FormFields.jsx";
import { Skeleton } from "@/components/ui/Skeleton.jsx";

// Hooks
import { useGetCourses } from "@/features/courses/hooks/useCourses.js";
import { useGetUsers } from "@/features/users/hooks/useUsers.js";

export default function LecturerWorkload() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: coursesData, isLoading: loadingCourses } = useGetCourses({ pageSize: 1000 });
  const { data: lecturers = [], isLoading: loadingLects } = useGetUsers("LECTURER");

  const courses = coursesData?.items || [];

  const workloadData = useMemo(() => {
    if (loadingCourses || loadingLects) return [];

    return lecturers.map(lecturer => {
      const lecturerCourses = courses.filter(c => 
        c.lecturers?.some(l => String(l.id) === String(lecturer.id))
      );

      const studentCount = lecturerCourses.reduce((sum, c) => sum + (c.currentStudents || 0), 0);
      const projectCount = lecturerCourses.reduce((sum, c) => sum + (c.projectsCount || 0), 0);

      return {
        id: lecturer.id,
        name: lecturer.name,
        email: lecturer.email,
        courseCount: lecturerCourses.length,
        studentCount,
        projectCount,
        courses: lecturerCourses.map(c => c.code)
      };
    });
  }, [lecturers, courses, loadingCourses, loadingLects]);

  const filteredData = useMemo(() => {
    return workloadData.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase()) || 
                           item.email?.toLowerCase().includes(search.toLowerCase());
      
      if (filterType === "high") return matchesSearch && item.courseCount >= 4;
      if (filterType === "low") return matchesSearch && item.courseCount < 2;
      return matchesSearch;
    });
  }, [workloadData, search, filterType]);

  const totalClasses = courses.length;
  const avgWorkload = workloadData.length > 0 ? (totalClasses / workloadData.length).toFixed(1) : 0;

  if (loadingCourses || loadingLects) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-20 w-1/2 rounded-2xl" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-[24px]" />
          <Skeleton className="h-32 rounded-[24px]" />
          <Skeleton className="h-32 rounded-[24px]" />
        </div>
        <Skeleton className="h-96 rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Khối lượng Giảng dạy"
        subtitle="Theo dõi và cân bằng khối lượng công việc, số lượng sinh viên và dự án của đội ngũ giảng viên."
        breadcrumb={["Admin", "Workload"]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Trung bình" value={`${avgWorkload} Lớp/GV`} icon={TrendingUp} variant="indigo" />
        <StatsCard label="Tổng giảng viên" value={lecturers.length} icon={UserCheck} variant="success" />
        <StatsCard label="Lớp đang vận hành" value={totalClasses} icon={BookOpen} variant="info" />
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
           <div className="flex-1">
              <InputField 
                placeholder="Tìm giảng viên..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                icon={Search} 
              />
           </div>
           <div className="w-64">
              <SelectField value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">Tất cả giảng viên</option>
                <option value="high">Khối lượng cao (&ge; 4 lớp)</option>
                <option value="low">Khối lượng thấp (&lt; 2 lớp)</option>
              </SelectField>
           </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
         <CardHeader className="border-b border-gray-50 py-5 px-8 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
               <BarChart3 size={18} className="text-teal-600" /> Thống kê chi tiết
            </CardTitle>
         </CardHeader>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                     <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Giảng viên</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Số lớp</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Sinh viên</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Dự án</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Lớp phụ trách</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredData.map((item, idx) => (
                     <tr key={item.id} className="hover:bg-gray-50/50 transition-colors animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xs uppercase shadow-sm">
                                 {item.name?.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-black text-gray-800 tracking-tight text-sm uppercase">{item.name}</p>
                                 <p className="text-[10px] font-bold text-gray-400">{item.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className={`inline-block px-3 py-1 rounded-xl font-black text-xs border ${
                              item.courseCount >= 4 ? "bg-red-50 text-red-600 border-red-100" : "bg-teal-50 text-teal-600 border-teal-100"
                           }`}>
                              {item.courseCount}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-center text-sm font-black text-gray-600">
                           {item.studentCount}
                        </td>
                        <td className="px-8 py-5 text-center text-sm font-black text-gray-600">
                           {item.projectCount}
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {item.courses.map(code => (
                                 <span key={code} className="px-2 py-0.5 bg-gray-100 text-[9px] font-black text-gray-400 rounded-md uppercase border border-gray-200">
                                    {code}
                                 </span>
                              ))}
                              {item.courses.length === 0 && <span className="text-[10px] text-gray-300 italic">Chưa có lớp</span>}
                           </div>
                        </td>
                     </tr>
                  ))}
                  {filteredData.length === 0 && (
                     <tr>
                        <td colSpan={5} className="py-20 text-center text-gray-400 text-xs font-black uppercase tracking-widest">
                           Không tìm thấy giảng viên nào
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
}






