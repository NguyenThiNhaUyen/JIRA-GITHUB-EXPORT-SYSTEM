import { useState, useEffect } from "react";
import client from "../../api/client.js";
import { unwrap } from "../../api/unwrap.js";
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

// Feature Hooks & API Functions
import { getCourses, importStudentsExcel } from "../../features/courses/api/courseApi.js";
import { 
  useCreateCourse, 
  useUpdateCourse, 
  useDeleteCourse, 
  useAssignLecturer, 
  useEnrollStudents,
  useRemoveLecturer,
  useUnenrollStudent 
} from "../../features/courses/hooks/useCourses.js";
import { getSemesters, getSubjects } from "../../features/system/api/systemApi.js";
import { getUsers } from "../../features/users/api/userApi.js";

export default function CourseManagement() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      // 1. Lấy danh sách Lớp học (Đã qua Mapper)
      const coursesData = await getCourses();
      setCourses(coursesData?.items || []);

      // 2. Lấy danh sách Môn học (Đã qua Mapper)
      const subjectsData = await getSubjects();
      setSubjects(subjectsData || []);
      
      // 3. Lấy danh sách Kỳ học (Đã qua Mapper)
      const semestersData = await getSemesters();
      setSemesters(semestersData || []);
    } catch (error) {
      showError("Không thể tải dữ liệu từ máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [lecturers, setLecturers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loadingLects, setLoadingLects] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      setLoadingLects(true);
      try {
        const [lecData, stuData] = await Promise.all([
          getUsers("LECTURER"),
          getUsers("STUDENT"),
        ]);
        setLecturers(Array.isArray(lecData) ? lecData : []);
        setAllStudents(Array.isArray(stuData) ? stuData : []);
      } catch (err) {
        showError("Không thể tải danh sách người dùng");
      } finally {
        setLoadingLects(false);
      }
    }
    loadUsers();
  }, []);

  // Mutations
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();
  const assignMutation = useAssignLecturer();
  const enrollMutation = useEnrollStudents();
  const removeLecturerMutation = useRemoveLecturer();
  const unenrollStudentMutation = useUnenrollStudent();

  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewStudentsModal, setShowViewStudentsModal] = useState(false);

  const [viewStudentsCourse, setViewStudentsCourse] = useState(null);
  const [viewStudentsList, setViewStudentsList] = useState([]);

  const [importCourse, setImportCourse] = useState(null);
  const [importSelectedIds, setImportSelectedIds] = useState([]);

  const [filterSemester, setFilterSemester] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [activeImportTab, setActiveImportTab] = useState("manual"); // "manual" | "excel"
  const [excelFile, setExcelFile] = useState(null); // Selected Excel file
  const [isUploading, setIsUploading] = useState(false); // Upload in-progress

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    subjectId: "",
    semesterId: "",
    maxStudents: 40,
    status: "ACTIVE",
  });
  const [assignForm, setAssignForm] = useState({
    lecturerId: "",
  });

  const isLoading = loading || loadingLects;

  const handleExport = () => {
    try {
      // 1. Prepare CSV headers
      const headers = ["Mã Lớp", "Môn Học", "Học Kỳ", "Sinh Viên", "Tối Đa", "Giảng Viên"];

      // 2. Prepare CSV rows from courses data
      const rows = courses.map(course => {
        const subjectCode = getSubjectCode(course.subjectId);
        const semesterName = getSemesterName(course.semesterId);
        const lecturerName = getCourseLecturer(course.id) || "Chưa có GV";
        return [
          course.code,
          subjectCode,
          semesterName,
          course.currentStudents || 0,
          course.maxStudents || 0,
          lecturerName
        ].map(val => `"${val}"`).join(","); // wrap in quotes to handle commas in data
      });

      // 3. Combine headers and rows
      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n"); // \uFEFF for UTF-8 BOM

      // 4. Create a Blob and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `DanhSachLopHoc_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      success("Đã xuất danh sách lớp học thành công!");
    } catch (err) {
      error("Lỗi khi xuất file Excel/CSV");
    }
  };
  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      subjectId: "",
      semesterId: "",
      maxStudents: 40,
      status: "ACTIVE",
    });
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.course_code || "",
      name: course.course_name || "",
      description: course.description || "",
      subjectId: course.subjectId || course.subject?.id || "",
      semesterId: course.semesterId || course.semester?.id || "",
      maxStudents: course.max_students || 40,
      status: course.status || "ACTIVE",
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
    try {
      const payload = {
        courseCode: formData.code,
        courseName: formData.name,
        subjectId: Number(formData.subjectId),
        semesterId: Number(formData.semesterId),
        maxStudents: Number(formData.maxStudents),
        status: formData.status
      };

      if (editingCourse) {
        await updateMutation.mutateAsync({ id: editingCourse.id, body: payload });
        success("Cập nhật lớp học thành công!");
      } else {
        await createMutation.mutateAsync(payload);
        success("Tạo lớp học thành công!");
      }
      setShowModal(false);
      loadData(); // Refresh list after success
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
    if (!assignForm.lecturerId) {
      showError("Vui lòng chọn giảng viên trước khi phân công");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        courseId: selectedCourse.id,
        lecturerUserId: Number(assignForm.lecturerId)
      });
      const lecturer = lecturers.find((l) => l.id === assignForm.lecturerId);
      success(`Đã phân công GV ${lecturer?.name} cho lớp ${selectedCourse.course_code || selectedCourse.code}!`);
      setShowAssignModal(false);
      loadData(); // Refresh list after assignment
    } catch (err) {
      showError(err.message || "Phân công thất bại");
    }
  };

  const getSemesterName = (semesterId) => {
    const sem = semesters.find(s => String(s.id) === String(semesterId));
    return sem?.name || "N/A";
  };

  const getSubjectCode = (subjectId) => {
    const subject = subjects.find(s => String(s.id) === String(subjectId));
    return subject ? (subject.subject_code || subject.code || '-') : '-';
  };

  const getCourseLecturers = (course) => {
    return course.lecturers || [];
  };

  const getCourseLecturerName = (course) => {
    const lecs = getCourseLecturers(course);
    // Prefer full_name if available from snake_case, else .name
    return lecs.length > 0 ? (lecs[0].full_name || lecs[0].name) : null;
  };

  const handleRemoveLecturer = async (course) => {
    const lecs = getCourseLecturers(course);
    if (lecs.length === 0) return;
    const lecturerName = lecs[0].full_name || lecs[0].name;
    if (!confirm(`Xóa giảng viên ${lecturerName} khỏi lớp ${course.course_code || course.code}?`)) return;
    try {
      await removeLecturerMutation.mutateAsync({ 
        courseId: course.id, 
        lecturerUserId: Number(lecs[0].id) 
      });
      success(`Đã xóa giảng viên khỏi lớp ${course.course_code || course.code}`);
      loadData();
    } catch (err) {
      showError(err.message || "Xóa thất bại");
    }
  };

  const handleOpenLecturerProfile = (lecturer) => {
    setSelectedLecturer(lecturer);
    setShowLecturerModal(true);
  };

  const handleOpenViewStudents = (course) => {
    setViewStudentsCourse(course);
    // Map enrollments to the structure the modal expects
    const students = (course.enrollments || []).map(en => ({
      id: String(en.user_id),
      enrollmentId: en.id, // if needed
      name: en.full_name,
      studentId: en.student_code,
      email: en.email
    }));
    setViewStudentsList(students);
    setShowViewStudentsModal(true);
  };

  const handleKickStudent = async (studentUserId, studentName) => {
    if (!confirm(`Đuổi ${studentName} khỏi lớp?`)) return;
    try {
      await unenrollStudentMutation.mutateAsync({ 
        courseId: viewStudentsCourse.id, 
        studentUserId: Number(studentUserId) 
      });
      success(`Đã đuổi ${studentName} khỏi lớp`);
      loadData();
      setShowViewStudentsModal(false); 
    } catch (err) {
      showError(err.message || "Xóa thất bại");
    }
  };

  // Import SV helpers
  const handleOpenImport = (course) => {
    setImportCourse(course);
    setImportSelectedIds([]);
    setShowImportModal(true);
  };

  const importAvailableStudents = allStudents.filter(student => {
    if (!importCourse) return true;
    const enrolledIds = (importCourse.enrollments || []).map(en => String(en.user_id));
    return !enrolledIds.includes(String(student.id));
  });

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFile(file);
  };

  const handleExcelSubmit = async () => {
    if (!excelFile || !importCourse) return;
    try {
      setIsUploading(true);
      await importStudentsExcel(importCourse.id, excelFile);
      success(`Đã import thành công từ file ${excelFile.name}! Danh sách sinh viên đang được cập nhật.`);
      setExcelFile(null);
      setShowImportModal(false);
      loadData(); // Refresh
    } catch (err) {
      showError(err.message || "Import từ Excel thất bại. Kiểm tra lại định dạng file.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleImportStudent = (id) => {
    setImportSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleImportSubmit = async () => {
    if (importSelectedIds.length === 0) {
      showError("Vui lòng chọn ít nhất 1 sinh viên!");
      return;
    }
    try {
      await enrollMutation.mutateAsync({
        courseId: importCourse.id,
        studentUserIds: importSelectedIds.map(id => Number(id)),
      });
      success(`Đã thêm ${importSelectedIds.length} sinh viên vào lớp ${importCourse.code}!`);
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
                                  {course.course_code}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5 max-w-[150px] truncate">
                                  {course.course_name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <div className="flex flex-col gap-1.5 items-center">
                              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
                                {course.subject_code}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {course.semester_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-center">
                            {lecturerName ? (
                              <button 
                                onClick={() => handleOpenLecturerProfile(course.lecturers[0])}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-all"
                              >
                                {lecturerName}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium italic">Chưa phân công</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-center">
                            <div className="text-sm font-semibold text-gray-700">
                              {course.enrollments?.length ?? course.currentStudents ?? 0}<span className="text-gray-400 text-xs ml-1">/ {course.max_students || course.maxStudents}</span>
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
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm uppercase"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              required
            >
              <option value="">-- Chọn mã lớp --</option>
              <option value="SE1811">SE1811</option>
              <option value="SE1812">SE1812</option>
              <option value="SE1813">SE1813</option>
              <option value="SE1821">SE1821</option>
              <option value="SE1822">SE1822</option>
              <option value="SE1823">SE1823</option>
              <option value="IA1801">IA1801</option>
              <option value="AI1802">AI1802</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Chọn mã lớp từ danh sách chuẩn của trường</p>
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
                <option value="">Chọn môn học</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_code} - {subject.subject_name}
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
                  {selectedCourse.course_code || selectedCourse.code} — {selectedCourse.course_name || selectedCourse.name}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Môn học: {getSubjectCode(selectedCourse.subjectId || selectedCourse.subject_id)} | Học kỳ:{" "}
                {getSemesterName(selectedCourse.semesterId || selectedCourse.semester_id)}
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
              disabled={!assignForm.lecturerId || assignMutation.isLoading}
              className={`rounded-xl shadow-sm ${
                !assignForm.lecturerId 
                  ? "bg-gray-300 cursor-not-allowed text-gray-500" 
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {assignMutation.isLoading ? "Đang xử lý..." : "Phân công"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Students Modal */}
      {/* Import Students Modal - UPGRADED */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Sinh viên vào lớp"
        size="lg"
      >
        <div className="space-y-6">
          {importCourse && (
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Lớp học: <span className="font-bold text-gray-900">{(importCourse.courseCode || importCourse.course_code || importCourse.code) || "N/A"} — {(importCourse.courseName || importCourse.course_name || importCourse.name) || "N/A"}</span></p>
                <p className="text-xs text-gray-500">{getSubjectCode(importCourse.subject_id || importCourse.subjectId)} · {getSemesterName(importCourse.semester_id || importCourse.semesterId)}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold px-2 py-1 bg-purple-200 text-purple-700 rounded-full">
                  {importAvailableStudents.length} SV khả dụng
                </span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveImportTab("manual")}
              className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                activeImportTab === "manual"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Chọn từ hệ thống
            </button>
            <button
              onClick={() => setActiveImportTab("excel")}
              className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                activeImportTab === "excel"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Tải file Excel
            </button>
          </div>

          {activeImportTab === "manual" ? (
            <div className="space-y-4">
              <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {importAvailableStudents.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 italic font-medium">Tất cả sinh viên khả dụng đã được thêm vào lớp này</div>
                ) : (
                  importAvailableStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => toggleImportStudent(student.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        importSelectedIds.includes(student.id)
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : "bg-white border-gray-100 hover:border-blue-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.studentId} · {student.email}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        importSelectedIds.includes(student.id)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      }`}>
                        {importSelectedIds.includes(student.id) && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm text-gray-500">Đang chọn <span className="font-bold text-blue-600">{importSelectedIds.length}</span> sinh viên</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowImportModal(false)} className="rounded-xl border-gray-200">Hủy</Button>
                  <Button 
                    onClick={handleImportSubmit}
                    disabled={importSelectedIds.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl px-6"
                  >
                    Import ngay
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div 
                className={`border-2 border-dashed rounded-2xl p-10 text-center space-y-4 transition-all cursor-pointer group relative ${excelFile ? 'border-green-400 bg-green-50/20' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/30'}`}
              >
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {excelFile ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto text-green-600">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-700">{excelFile.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{(excelFile.size / 1024).toFixed(1)} KB — Nhấn "Import Excel" để xác nhận</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto text-purple-600 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Kéo &amp; thả file Excel hoặc nhấn để chọn</p>
                      <p className="text-xs text-gray-400 mt-1">.xlsx, .xls (Tối đa 5MB)</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100/50 flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <div className="text-xs text-amber-700 leading-relaxed">
                  <p className="font-bold mb-1">Cấu trúc file yêu cầu:</p>
                  <ul className="list-disc list-inside space-y-1 opacity-80">
                    <li>Cột A: Mã số sinh viên (StudentCode)</li>
                    <li>Cột B: Họ và tên đầy đủ (FullName)</li>
                    <li>Cột C: Email chính thức (@fpt.edu.vn)</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" onClick={() => { setShowImportModal(false); setExcelFile(null); }} className="rounded-xl border-gray-200">Hủy</Button>
                <Button 
                  onClick={handleExcelSubmit}
                  disabled={!excelFile || isUploading}
                  className={`rounded-xl px-6 ${excelFile && !isUploading ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {isUploading ? 'Đang import...' : 'Import Excel'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Lecturer Detail Modal */}
      <Modal
        isOpen={showLecturerModal}
        onClose={() => setShowLecturerModal(false)}
        title="Thông tin chi tiết Giảng viên"
        size="md"
      >
        {selectedLecturer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-inner uppercase">
                {selectedLecturer.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedLecturer.name}</h3>
                <p className="text-sm text-gray-500">{selectedLecturer.email}</p>
                <span className="mt-1 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">
                  Giảng viên chuyên ngành
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Mã giảng viên</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{selectedLecturer.lecturerCode || 'N/A'}</p>
              </div>
              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Khoa / Bộ môn</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">{selectedLecturer.department || 'Chưa có thông tin'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-800 px-1">
                {selectedLecturer.department ? `Khoa: ${selectedLecturer.department}` : 'Các lớp đang phụ trách'}
              </h4>
              <div className="space-y-2">
                {(selectedLecturer.assigned_courses && selectedLecturer.assigned_courses.length > 0) ? (
                  selectedLecturer.assigned_courses.map((courseCode, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-green-100 bg-green-50/30 flex justify-between items-center">
                      <p className="text-sm font-bold text-gray-800">{courseCode}</p>
                      <CheckCircle className="text-green-500" size={16} />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic py-4 text-center">Chưa có dữ liệu lớp phụ trách từ hệ thống.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button onClick={() => setShowLecturerModal(false)} className="bg-gray-800 hover:bg-gray-900 text-white rounded-xl px-8 shadow-md">
                Đóng
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
                Lớp: <span className="font-bold text-gray-900">{viewStudentsCourse.code || viewStudentsCourse.course_code || "N/A"} — {viewStudentsCourse.name || viewStudentsCourse.course_name || "N/A"}</span>
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
                      <p className="text-sm font-medium text-gray-800 truncate">{stu.name || stu.full_name || "Chưa có tên"}</p>
                      <p className="text-xs text-gray-400">
                        {stu.studentId || stu.student_code || "N/A"} · {stu.email || "-"}
                      </p>
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
