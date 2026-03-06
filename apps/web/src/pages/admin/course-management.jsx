import { useState, useEffect } from "react";
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
import db from "../../mock/db.js";
import { useToast } from "../../components/ui/toast.jsx";
import { useNavigate } from "react-router-dom";
import { BookOpen, AlertCircle, PlayCircle, CheckCircle, Upload } from "lucide-react";

export default function CourseManagement() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewStudentsModal, setShowViewStudentsModal] = useState(false);
  const [viewStudentsCourse, setViewStudentsCourse] = useState(null);
  const [viewStudentsList, setViewStudentsList] = useState([]);
  const [importCourse, setImportCourse] = useState(null);
  const [importAvailableStudents, setImportAvailableStudents] = useState([]);
  const [importSelectedIds, setImportSelectedIds] = useState([]);
  const [filterSemester, setFilterSemester] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCourses(db.findMany("courses"));
    setSemesters(db.findMany("semesters"));
    setSubjects(db.findMany("subjects"));
    setLecturers(db.findMany("users.lecturers"));
  };

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
      code: course.code,
      name: course.name,
      description: course.description || "",
      subjectId: course.subjectId,
      semesterId: course.semesterId,
      maxStudents: course.maxStudents,
      status: course.status,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
      db.delete("courses", id);
      success("Xóa lớp học thành công!");
      loadData();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingCourse) {
      db.update("courses", editingCourse.id, formData);
      success("Cập nhật lớp học thành công!");
    } else {
      db.create("courses", {
        ...formData,
        currentStudents: 0,
        createdAt: new Date().toISOString(),
      });
      success("Tạo lớp học thành công!");
    }

    setShowModal(false);
    loadData();
  };

  const handleAssignLecturer = (course) => {
    setSelectedCourse(course);
    setAssignForm({
      lecturerId: "",
    });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();

    const existing = db.findMany("courseLecturers", {
      courseId: selectedCourse.id,
    });

    if (existing.length > 0) {
      error("Lớp học này đã có giảng viên!");
      return;
    }

    db.create("courseLecturers", {
      courseId: selectedCourse.id,
      lecturerId: assignForm.lecturerId,
      role: "PRIMARY",
      assignedAt: new Date().toISOString(),
    });

    const lecturer = lecturers.find((l) => l.id === assignForm.lecturerId);
    success(`Đã phân công GV ${lecturer?.name} cho lớp ${selectedCourse.code}!`);
    setShowAssignModal(false);
    loadData();
  };

  const getSemesterName = (semesterId) => {
    const semester = semesters.find((s) => s.id === semesterId);
    return semester?.name || "N/A";
  };

  const getSubjectCode = (subjectId) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.code || "N/A";
  };

  const getCourseLecturerAssignment = (courseId) => {
    return db.findMany("courseLecturers", { courseId })[0] || null;
  };

  const getCourseLecturer = (courseId) => {
    const assignment = getCourseLecturerAssignment(courseId);
    if (!assignment) return null;
    const lecturer = lecturers.find((l) => l.id === assignment.lecturerId);
    return lecturer?.name || "N/A";
  };

  const handleRemoveLecturer = (course) => {
    const assignment = getCourseLecturerAssignment(course.id);
    if (!assignment) return;
    if (!confirm(`Xóa giảng viên khỏi lớp ${course.code}?`)) return;
    db.delete("courseLecturers", assignment.id);
    success(`Đã xóa GV khỏi lớp ${course.code}`);
    loadData();
  };

  const handleOpenViewStudents = (course) => {
    const enrollments = db.findMany("courseEnrollments", { courseId: course.id });
    const students = enrollments
      .map(e => db.findById("users.students", e.studentId))
      .filter(Boolean)
      .map((s, i) => ({ ...s, enrollmentId: enrollments[i]?.id }));
    setViewStudentsCourse(course);
    setViewStudentsList(students);
    setShowViewStudentsModal(true);
  };

  const handleKickStudent = (enrollmentId, studentName) => {
    if (!confirm(`Đuổi ${studentName} khỏi lớp?`)) return;
    // remove enrollment
    const enrollments = db.findMany("courseEnrollments", { courseId: viewStudentsCourse.id });
    const target = enrollments.find(e => {
      const s = db.findById("users.students", e.studentId);
      return s?.name === studentName;
    });
    if (target) db.delete("courseEnrollments", target.id);
    // update count
    const remaining = db.findMany("courseEnrollments", { courseId: viewStudentsCourse.id }).length;
    db.update("courses", viewStudentsCourse.id, { currentStudents: remaining });
    success(`Đã đuổi ${studentName} khỏi lớp`);
    // refresh modal list
    handleOpenViewStudents(viewStudentsCourse);
    loadData();
  };

  // Import SV helpers
  const handleOpenImport = (course) => {
    const enrolledIds = db.findMany("courseEnrollments", { courseId: course.id }).map(e => e.studentId);
    const allStudents = db.findMany("users.students");
    const available = allStudents.filter(s => !enrolledIds.includes(s.id));
    setImportCourse(course);
    setImportAvailableStudents(available);
    setImportSelectedIds([]);
    setShowImportModal(true);
  };

  const toggleImportStudent = (id) => {
    setImportSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleImportSubmit = () => {
    if (importSelectedIds.length === 0) {
      error("Vui lòng chọn ít nhất 1 sinh viên!");
      return;
    }
    importSelectedIds.forEach(studentId => {
      db.create("courseEnrollments", {
        courseId: importCourse.id,
        studentId,
        enrolledAt: new Date().toISOString(),
        status: "ACTIVE",
      });
    });
    // Update currentStudents count on the course record
    const enrolled = db.findMany("courseEnrollments", { courseId: importCourse.id }).length;
    db.update("courses", importCourse.id, { currentStudents: enrolled });
    success(`Đã thêm ${importSelectedIds.length} sinh viên vào lớp ${importCourse.code}!`);
    setShowImportModal(false);
    loadData();
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
                  .filter(c => !filterSemester || c.semesterId === filterSemester)
                  .map((course, index) => {
                    const lecturerName = getCourseLecturer(course.id);
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

            {/* Excel upload placeholder */}
            <div className="border-2 border-dashed border-purple-200 rounded-xl p-4 flex flex-col items-center gap-2 bg-purple-50/30 cursor-pointer hover:bg-purple-50 transition-colors">
              <Upload size={24} className="text-purple-400" />
              <p className="text-sm font-medium text-purple-700">Kéo & thả file Excel hoặc nhấn để chọn</p>
              <p className="text-xs text-gray-400">.xlsx, .xls (tính năng parse sẽ kết nối BE)</p>
            </div>

            {/* Student checkbox list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Chọn sinh viên chưa có trong lớp ({importAvailableStudents.length} SV)
                </label>
                {importSelectedIds.length > 0 && (
                  <span className="text-xs font-semibold text-white bg-purple-600 rounded-full px-2 py-0.5">
                    Đã chọn: {importSelectedIds.length}
                  </span>
                )}
              </div>
              {importAvailableStudents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Tất cả sinh viên đã có trong lớp này.</p>
              ) : (
                <div className="max-h-[280px] overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                  {importAvailableStudents.map((stu) => (
                    <label
                      key={stu.id}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-purple-50/40 transition-colors ${importSelectedIds.includes(stu.id) ? 'bg-purple-50' : ''
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={importSelectedIds.includes(stu.id)}
                        onChange={() => toggleImportStudent(stu.id)}
                        className="accent-purple-600 w-4 h-4"
                      />
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {stu.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{stu.name}</p>
                        <p className="text-xs text-gray-400">{stu.studentId} · {stu.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
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
                disabled={importSelectedIds.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm disabled:opacity-50"
              >
                Thêm {importSelectedIds.length > 0 ? `${importSelectedIds.length} SV` : ''} vào lớp
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
                      onClick={() => handleKickStudent(stu.enrollmentId, stu.name)}
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
