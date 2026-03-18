import { useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, Users, Search } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader.jsx";
import { StatsCard } from "@/components/shared/StatsCard.jsx";
import { InputField } from "@/components/shared/FormFields.jsx";

// Local Components
import { CourseCard } from "@/pages/lecturer/components/MyCourses/CourseCard.jsx";

// Hooks
import { useMyCoursesHook } from "./hooks/useMyCoursesHook.js";

export default function MyCourses() {
  const navigate = useNavigate();
  const {
    search, setSearch,
    courses,
    filtered,
    totalGroups,
    totalStudents,
    isLoading
  } = useMyCoursesHook();

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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
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






