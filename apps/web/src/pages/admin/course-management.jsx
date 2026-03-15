import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, AlertCircle, PlayCircle, CheckCircle, Upload, Download, Plus } from "lucide-react";

// Components UI
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { useToast } from "../../components/ui/toast.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { SelectField } from "../../components/shared/FormFields.jsx";

// Feature Hooks
import { 
  useGetCourses, 
  useCreateCourse, 
  useUpdateCourse, 
  useDeleteCourse, 
  useAssignLecturer, 
  useEnrollStudents,
  useImportStudents,
  useGetEnrolledStudents,
//   useUnenrollStudent
} from "../../features/courses/hooks/useCourses.js";
import { useGetSemesters, useGetSubjects } from "../../features/system/hooks/useSystem.js";
import { useGetUsers } from "../../features/users/hooks/useUsers.js";

export default function CourseManagement() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  // Data Fetching
  const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses();
  const courses = coursesData.items || [];
  const { data: semesters = [] } = useGetSemesters();
  const { data: subjects = [] } = useGetSubjects();
  const { data: lecturers = [] } = useGetUsers("LECTURER");
  const { data: allStudents = [] } = useGetUsers("STUDENT");

  // Mutations
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();
  const assignMutation = useAssignLecturer();
  const importStudentsMutation = useImportStudents();

  // State
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCourse, setImportCourse] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [filterSemester, setFilterSemester] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    code: "", name: "", description: "", subjectId: "", semesterId: "", lecturerId: "",
    room: "", startDate: "", endDate: "", minStudents: 10, maxStudents: 40, status: "ACTIVE",
  });

  const isLoading = loadingCourses;

  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({
      code: "", name: "", description: "", subjectId: "", semesterId: "", lecturerId: "",
      room: "", startDate: "", endDate: "", minStudents: 10, maxStudents: 40, status: "ACTIVE",
    });
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({ ...course });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
      try {
        await deleteMutation.mutateAsync(id);
        success("Đã xóa lớp học thành công");
      } catch (err) {
        showError(err.message || "Xóa thất bại");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateMutation.mutateAsync({ id: editingCourse.id, ...formData });
        success("Cập nhật lớp học thành công");
      } else {
        await createMutation.mutateAsync(formData);
        success("Tạo lớp học mới thành công");
      }
      setShowModal(false);
    } catch (err) {
      showError(err.message || "Lỗi thao tác");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Quản lý Lớp học"
        subtitle="Hệ thống quản lý danh sách lớp, phân công giảng viên và sinh viên."
        breadcrumb={["Admin", "Quản lý", "Lớp học"]}
        actions={[
          <Button key="add" onClick={handleCreate} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-11 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0">
            <Plus size={16} className="mr-2" /> Thêm Lớp học
          </Button>
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng số lớp" value={courses.length} icon={BookOpen} variant="indigo" />
        <StatsCard label="Đang mở" value={courses.filter(c => c.status === 'ACTIVE').length} icon={PlayCircle} variant="success" />
        <StatsCard label="Sắp mở" value={courses.filter(c => c.status === 'UPCOMING').length} icon={AlertCircle} variant="warning" />
        <StatsCard label="Đã đóng" value={courses.filter(c => c.status === 'COMPLETED').length} icon={CheckCircle} variant="default" />
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 py-5 px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest leading-none">Danh sách lớp học</CardTitle>
            <div className="w-full sm:w-64">
              <SelectField
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
              >
                <option value="">Tất cả học kỳ</option>
                {semesters.map(sem => (
                  <option key={sem.id} value={sem.id}>{sem.name}</option>
                ))}
              </SelectField>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 font-medium">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Lớp học</TableHead>
                    <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Thông tin</TableHead>
                    <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Giảng viên</TableHead>
                    <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Trạng thái</TableHead>
                    <TableHead className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-50">
                  {courses
                    .filter(c => !filterSemester || String(c.semesterId) === String(filterSemester))
                    .map((course, idx) => (
                      <TableRow key={course.id} className="hover:bg-teal-50/20 transition-all border-none group">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-gray-300">#{idx + 1}</span>
                            <div className="text-left">
                              <p className="font-bold text-gray-800 text-sm leading-tight">{course.code}</p>
                              <p className="text-[11px] text-gray-400 font-medium mt-0.5">{course.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                           <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 uppercase tracking-wider">
                             {(subjects.find(s => s.id === course.subjectId))?.code || 'N/A'}
                           </span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                           <p className="text-sm font-bold text-gray-700">
                             {(lecturers.find(l => l.id === course.lecturerId))?.name || <span className="text-gray-300 italic font-medium">Chưa phân công</span>}
                           </p>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                           <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                             course.status === 'ACTIVE' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 
                             course.status === 'UPCOMING' ? 'text-sky-700 bg-sky-50 border-sky-100' : 
                             'text-gray-500 bg-gray-100 border-gray-200'
                           }`}>
                             {course.status === 'ACTIVE' ? 'Đang mở' : course.status === 'UPCOMING' ? 'Sắp mở' : 'Đã đóng'}
                           </span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                             <Button onClick={() => handleEdit(course)} variant="ghost" className="h-8 w-8 p-0 rounded-lg text-teal-600 hover:bg-teal-50">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                             </Button>
                             <Button onClick={() => handleDelete(course.id)} variant="ghost" className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simplified Modal Logic here for demonstration */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingCourse ? "Sửa lớp học" : "Tạo lớp học mới"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <SelectField label="Môn học" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
                <option value="">Chọn môn</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
              </SelectField>
              <SelectField label="Học kỳ" value={formData.semesterId} onChange={e => setFormData({...formData, semesterId: e.target.value})}>
                <option value="">Chọn học kỳ</option>
                {semesters.map(sem => <option key={sem.id} value={sem.id}>{sem.name}</option>)}
              </SelectField>
           </div>
           {/* Thêm các field khác tương tự... */}
           <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl h-11 px-6 font-bold">Hủy</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 px-8 font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0">
                {editingCourse ? "Lưu thay đổi" : "Tạo lớp học"}
              </Button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
