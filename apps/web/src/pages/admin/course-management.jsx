import { useState } from "react";
import { Button } from "../../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.jsx";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { useNavigate } from "react-router-dom";
import { BookOpen, AlertCircle, PlayCircle, CheckCircle, Upload } from "lucide-react";

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
  useUnenrollStudent
} from "../../features/courses/hooks/useCourses.js";
import { useGetSemesters, useGetSubjects } from "../../features/system/hooks/useSystem.js";
import { useGetUsers } from "../../features/users/hooks/useUsers.js";

export default function CourseManagement() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  // Data Fetching
  const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses();
  const courses = coursesData.items || [];

  const { data: semesters = [], isLoading: loadingSems } = useGetSemesters();
  const { data: subjects = [], isLoading: loadingSubs } = useGetSubjects();
  const { data: lecturers = [], isLoading: loadingLects } = useGetUsers("LECTURER");
  const { data: allStudents = [], isLoading: loadingStus } = useGetUsers("STUDENT");

  // Mutations
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();
  const assignMutation = useAssignLecturer();
  const enrollMutation = useEnrollStudents();
  const importStudentsMutation = useImportStudents();

  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewStudentsModal, setShowViewStudentsModal] = useState(false);

  const [viewStudentsCourse, setViewStudentsCourse] = useState(null);
  const { data: enrollmentData = { items: [] }, refetch: refetchStudents } = useGetEnrolledStudents(viewStudentsCourse?.id, { pageSize: 100 });
  const viewStudentsList = enrollmentData.items || [];

  const [importCourse, setImportCourse] = useState(null);
  const [importFile, setImportFile] = useState(null);

  const [filterSemester, setFilterSemester] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
const [formData, setFormData] = useState({
  code: "",
  name: "",
  description: "",
  subjectId: "",
  semesterId: "",
  lecturerId: "",
  room: "",
  startDate: "",
  endDate: "",
  minStudents: 10,
  maxStudents: 40,
  status: "ACTIVE",
});
  const [assignForm, setAssignForm] = useState({
    lecturerId: "",
  });

  const isLoading = loadingCourses || loadingSems || loadingSubs || loadingLects || loadingStus;

  const handleExport = () => {
  try {

    const headers = [
      "Mã Lớp",
      "Môn Học",
      "Học Kỳ",
      "Sinh Viên",
      "Tối Đa",
      "Giảng Viên"
    ];

    const rows = courses.map(course => {

      const subjectCode = getSubjectCode(course.subjectId);
      const semesterName = getSemesterName(course.semesterId);
      const lecturerName = getCourseLecturerName(course) || "Chưa có GV";

      return [
        course.code,
        subjectCode,
        semesterName,
        course.currentStudents ?? 0,
        course.maxStudents ?? 0,
        lecturerName
      ]
        .map(v => `"${v}"`)
        .join(",");

    });

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows].join("\n");

    const blob = new Blob(
      [csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `DanhSachLopHoc_${Date.now()}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    success("Đã xuất danh sách lớp học thành công!");

  } catch {
    showError("Lỗi khi xuất file CSV");
  }
};
  

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
  code: course.code,
  name: course.name,
  description: course.description || "",
  subjectId: course.subjectId,
  semesterId: course.semesterId,
  lecturerId: course.lecturers?.[0]?.id || "",
  room: course.room || "",
  startDate: course.startDate || "",
  endDate: course.endDate || "",
  minStudents: course.minStudents || 10,
  maxStudents: course.maxStudents,
  status: course.status,
});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
      try {
        await deleteMutation.mutateAsync(id);
        success("Xóa lớp học thành công!");
      } catch (err) {
        showError(err.message || "Xóa thất bại");
      }
    }
  };

  const handleSubmit = async (e) => {

  e.preventDefault();

  if (formData.minStudents > formData.maxStudents) {
    showError("Sĩ số tối thiểu không được lớn hơn sĩ số tối đa");
    return;
  }

  if (formData.startDate && formData.endDate) {
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      showError("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }
  }

  try {

    if (editingCourse) {

      await updateMutation.mutateAsync({
        id: editingCourse.id,
        body: formData
      });

      success("Cập nhật lớp học thành công!");

    } else {

      await createMutation.mutateAsync(formData);

      success("Tạo lớp học thành công!");

    }

    setShowModal(false);

  } catch (err) {

    showError(err.message || "Thao tác thất bại");

  }

};

  const handleAssignLecturer = (course) => {
    setSelectedCourse(course);
    setAssignForm({
      lecturerId: "",
    });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignMutation.mutateAsync({
        courseId: selectedCourse.id,
        lecturerUserId: assignForm.lecturerId
      });
      const lecturer = lecturers.find((l) => l.id === assignForm.lecturerId);
      success(`Đã phân công GV ${lecturer?.name} cho lớp ${selectedCourse.code}!`);
      setShowAssignModal(false);
    } catch (err) {
      showError(err.message || "Phân công thất bại");
    }
  };

  const getSemesterName = (semesterId) => {
    const sem = semesters.find(s => String(s.id) === String(semesterId));
    return sem?.name || "N/A";
  };

  const getSubjectCode = (subjectId) => {
    const sub = subjects.find(s => String(s.id) === String(subjectId));
    return sub?.code || "N/A";
  };

  const getCourseLecturers = (course) => {
    return course.lecturers || [];
  };

  const getCourseLecturerName = (course) => {
    const lecs = getCourseLecturers(course);
    return lecs.length > 0 ? lecs[0].name : null;
  };

  const handleRemoveLecturer = async (course) => {
    const lecs = getCourseLecturers(course);
    if (lecs.length === 0) return;
    if (!confirm(`Xóa giảng viên khỏi lớp ${course.code}?`)) return;
    try {
      // Assuming we have a way to remove lecturer, for now use a placeholder or log
      // await removeLecturerMutation.mutateAsync({ courseId: course.id, lecturerUserId: lecs[0].id });
      showError("Tính năng xóa giảng viên đang được cập nhật ở BE");
    } catch (err) {
      showError(err.message || "Xóa thất bại");
    }
  };

  const handleOpenViewStudents = (course) => {
    setViewStudentsCourse(course);
    setShowViewStudentsModal(true);
  };

 const unenrollMutation = useUnenrollStudent();

 const handleKickStudent = async (studentUserId, studentName) => {

  if (!confirm(`Đuổi ${studentName} khỏi lớp?`)) return;

  try {
    await unenrollMutation.mutateAsync({
      courseId: viewStudentsCourse.id,
      studentUserId: studentUserId
    });
    success(`Đã đuổi ${studentName} khỏi lớp`);
    // React Query sẽ tự động invalidate và refetch nhờ mutation onSuccess
  } catch (err) {
    showError(err.message || "Không thể đuổi sinh viên");
  }

};
  // Import SV helpers
  const handleOpenImport = (course) => {
    setImportCourse(course);
    setImportFile(null);
    setShowImportModal(true);
  };

const handleCreate = () => {

  setEditingCourse(null);

  setFormData({
    code: "",
    name: "",
    description: "",
    subjectId: "",
    semesterId: "",
    lecturerId: "",
    room: "",
    startDate: "",
    endDate: "",
    minStudents: 10,
    maxStudents: 40,
    status: "ACTIVE",
  });

  setShowModal(true);

};

  const importAvailableStudents = allStudents.filter(
  s => !viewStudentsList.some(v => v.id === s.id)
);

  const toggleImportStudent = (id) => {
    setImportSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleImportSubmit = async () => {
    if (!importCourse || !importFile) {
      showError("Vui lòng chọn file Excel (.xlsx, .csv)");
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      await importStudentsMutation.mutateAsync({
        courseId: importCourse.id,
        formData
      });
      success(`Đã import sinh viên vào lớp ${importCourse.code} thành công!`);
      setShowImportModal(false);
    } catch (err) {
      showError(err.message || "Import thất bại");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards - Edaca Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-inner">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tổng số lớp</p>
            <h3 className="text-2xl font-bold text-gray-800">{courses.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-inner">
            <PlayCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Lớp đang mở</p>
            <h3 className="text-2xl font-bold text-gray-800">{courses.filter(c => c.status === 'ACTIVE').length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-inner">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Lớp sắp mở</p>
            <h3 className="text-2xl font-bold text-gray-800">{courses.filter(c => c.status === 'UPCOMING').length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-400 text-white flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Lớp đã đóng</p>
            <h3 className="text-2xl font-bold text-gray-800">{courses.filter(c => c.status === 'COMPLETED').length}</h3>
          </div>
        </div>
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 pb-4 pt-6 px-6">
          <div className="flex justify-between items-center gap-4">
            <CardTitle className="text-xl text-gray-800 font-bold whitespace-nowrap">Danh sách lớp học</CardTitle>
            <div className="flex items-center gap-3 w-full justify-end">
              <select
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm max-w-xs w-full"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
              >
                <option value="">Tất cả học kỳ</option>
                {semesters.map(sem => (
                  <option key={sem.id} value={sem.id}>{sem.name}</option>
                ))}
              </select>
              <Button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm h-10 px-5 shrink-0"
              >
                + Thêm Lớp học
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-100/50 hover:bg-transparent">
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Mã lớp / Tên lớp</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Môn học / Học kỳ</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Giảng viên</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Sĩ số</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-50">
                  {courses
                    .filter(c => !filterSemester || String(c.semesterId) === String(filterSemester))
                    .map((course, index) => {
                      const lecturerName = getCourseLecturerName(course);
                      return (
                        <TableRow key={course.id} className="hover:bg-gray-50/50 transition-colors border-none group">
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-8 flex justify-center text-sm font-medium text-gray-400">
                                {index + 1}
                              </div>
                              <div className="text-left">
                                <div className="font-semibold text-gray-800 text-sm">
                                  {course.code}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5 max-w-[150px] truncate">
                                  {course.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <div className="flex flex-col gap-1.5 items-center">
                              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
                                {getSubjectCode(course.subjectId)}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {getSemesterName(course.semesterId)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-center">
                            {lecturerName ? (
                              <span className="text-sm font-medium text-gray-700">{lecturerName}</span>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium italic">Chưa phân công</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-center">
                            <div className="text-sm font-semibold text-gray-700">
                              {course.currentStudents}<span className="text-gray-400 text-xs ml-1">/ {course.maxStudents}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-center">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider inline-block whitespace-nowrap ${course.status === 'ACTIVE' ? 'text-green-600 bg-green-50' :
                              course.status === 'UPCOMING' ? 'text-blue-600 bg-blue-50' :
                                'text-gray-600 bg-gray-100'
                              }`}>
                              {course.status === 'ACTIVE' ? 'ĐANG MỞ' : course.status === 'UPCOMING' ? 'SẮP MỞ' : 'ĐÃ ĐÓNG'}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2 transition-opacity min-w-[160px] flex-wrap">
                              {lecturerName ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 px-2 py-1 rounded-lg">{lecturerName}</span>
                                  <button
                                    onClick={() => handleRemoveLecturer(course)}
                                    title="Xóa GV khỏi lớp"
                                    className="text-red-400 hover:text-red-600 transition-colors font-bold text-sm px-1"
                                  >×</button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleAssignLecturer(course)}
                                  className="h-8 px-3 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200/50 shadow-none text-xs"
                                >
                                  + GV
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleOpenImport(course)}
                                className="h-8 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/50 shadow-none text-xs flex items-center gap-1"
                                title="Import sinh viên vào lớp"
                              >
                                <Upload size={11} /> Import SV
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenViewStudents(course)}
                                className="h-8 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/50 shadow-none text-xs"
                                title="Xem danh sách sinh viên trong lớp"
                              >
                                Xem SV
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(course)}
                                className="h-8 w-8 p-0 rounded-lg text-blue-600 border-blue-200/50 hover:bg-blue-50 hover:border-blue-300"
                                title="Sửa"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(course.id)}
                                className="h-8 w-8 p-0 rounded-lg text-red-500 border-red-200/50 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                                title="Xóa"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Course Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCourse ? "Sửa lớp học" : "Tạo lớp học mới"}
        size="lg" // Tăng kích thước modal
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã lớp *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toLowerCase() })
              }
              required
            />
            <p className="text-xs text-gray-500 mt-1">Ví dụ: se1821, exe1822, prn1823</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên lớp *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Môn học *
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: e.target.value })
                }
                required
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Học kỳ *
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={formData.semesterId}
                onChange={(e) =>
                  setFormData({ ...formData, semesterId: e.target.value })
                }
                required
              >
                <option value="">-- Chọn học kỳ --</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              rows="2"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sĩ số tối đa *
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={formData.maxStudents}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxStudents: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="ACTIVE">Đang mở (ACTIVE)</option>
                <option value="UPCOMING">Sắp mở (UPCOMING)</option>
                <option value="COMPLETED">Đã đóng (COMPLETED)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              className="rounded-xl border-gray-200"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
            >
              {editingCourse ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Lecturer Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Phân công Giảng viên"
        size="md"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {selectedCourse && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
              <p className="text-sm text-gray-600">
                Lớp học:{" "}
                <span className="font-bold text-gray-900">
                  {selectedCourse.code} - {selectedCourse.name}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Môn học: {getSubjectCode(selectedCourse.subjectId)} | Học kỳ:{" "}
                {getSemesterName(selectedCourse.semesterId)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn Giảng viên *
            </label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={assignForm.lecturerId}
              onChange={(e) =>
                setAssignForm({ ...assignForm, lecturerId: e.target.value })
              }
              required
            >
              <option value="">-- Chọn giảng viên --</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name} - {lecturer.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAssignModal(false)}
              className="rounded-xl border-gray-200"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm"
            >
              Phân công
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Students Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Sinh viên vào lớp"
        size="lg"
      >
        {importCourse && (
          <div className="space-y-4">
            {/* Course info */}
            <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100/60">
              <p className="text-sm text-gray-600">
                Lớp học: <span className="font-bold text-gray-900">{importCourse.code} — {importCourse.name}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getSubjectCode(importCourse.subjectId)} · {getSemesterName(importCourse.semesterId)}
              </p>
            </div>

            {/* Excel upload */}
            <div 
              onClick={() => document.getElementById("excel-upload").click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                importFile 
                  ? "border-green-300 bg-green-50/50" 
                  : "border-purple-200 bg-purple-50/30 hover:bg-purple-50"
              }`}
            >
              <input 
                id="excel-upload"
                type="file" 
                className="hidden" 
                accept=".xlsx, .xls, .csv" 
                onChange={(e) => setImportFile(e.target.files[0])}
              />
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                importFile ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"
              }`}>
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">
                  {importFile ? importFile.name : "Kéo & thả file Excel hoặc nhấn để chọn"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Hỗ trợ định dạng .xlsx, .xls, .csv</p>
              </div>
              {importFile && (
                <button 
                  type="button"
                  className="text-xs text-gray-400 hover:text-red-500 font-medium underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImportFile(null);
                  }}
                >
                  Xóa file
                </button>
              )}
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-[11px] text-blue-700 leading-relaxed">
              <p className="font-bold mb-1 italic opacity-80">Lưu ý cấu trúc file:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Dòng đầu tiên là tiêu đề (Header).</li>
                <li>Cột bắt buộc: <span className="font-bold uppercase">StudentId</span> (ví dụ SE123456) hoặc <span className="font-bold uppercase">Email</span>.</li>
                <li>Hệ thống sẽ tự động map và enroll sinh viên vào lớp.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImportModal(false)}
                className="rounded-xl border-gray-200"
              >
                Hủy
              </Button>
              <Button
                onClick={handleImportSubmit}
                disabled={!importFile}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm disabled:opacity-50"
              >
                Tiến hành Import
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View / Kick Students Modal */}
      <Modal
        isOpen={showViewStudentsModal}
        onClose={() => setShowViewStudentsModal(false)}
        title="Danh sách Sinh viên trong lớp"
        size="lg"
      >
        {viewStudentsCourse && (
          <div className="space-y-4">
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100/60">
              <p className="text-sm text-gray-600">
                Lớp: <span className="font-bold text-gray-900">{viewStudentsCourse.code} — {viewStudentsCourse.name}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{viewStudentsList.length} sinh viên đang enrolled</p>
            </div>
            {viewStudentsList.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Chưa có sinh viên nào trong lớp.</p>
            ) : (
              <div className="max-h-[360px] overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                {viewStudentsList.map((stu) => (
                  <div key={stu.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50/30 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {stu.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{stu.name}</p>
                      <p className="text-xs text-gray-400">{stu.studentId} · {stu.email}</p>
                    </div>
                    <button
                      onClick={() => handleKickStudent(stu.id, stu.name)}
                      className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                      Đuổi
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setShowViewStudentsModal(false)} className="rounded-xl border-gray-200">Đóng</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
