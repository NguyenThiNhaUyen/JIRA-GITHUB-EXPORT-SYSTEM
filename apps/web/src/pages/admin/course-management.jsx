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
import { BookOpen, AlertCircle, PlayCircle, CheckCircle } from "lucide-react";

export default function CourseManagement() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
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

  const getCourseLecturer = (courseId) => {
    const assignment = db.findMany("courseLecturers", { courseId })[0];
    if (!assignment) return null;

    const lecturer = lecturers.find((l) => l.id === assignment.lecturerId);
    return lecturer?.name || "N/A";
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
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl text-gray-800 font-bold">Danh sách lớp học</CardTitle>
            <Button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm h-10 px-5"
            >
              + Thêm Lớp học
            </Button>
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
                {courses.map((course, index) => {
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
                        <div className="flex items-center justify-center gap-2 transition-opacity min-w-[120px]">
                          <Button
                            size="sm"
                            onClick={() => !lecturerName && handleAssignLecturer(course)}
                            className={`h-8 px-3 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200/50 shadow-none text-xs ${lecturerName ? 'invisible pointer-events-none' : ''}`}
                          >
                            + GV
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
    </div>
  );
}
