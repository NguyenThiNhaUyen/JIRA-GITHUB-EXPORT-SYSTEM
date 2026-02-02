// Quản lý Lớp học - Trang quản lý lớp học cho Admin
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
import { Badge } from "../../components/ui/badge.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import db from "../../mock/db.js";
import { useToast } from "../../components/ui/toast.jsx";
import { useNavigate } from "react-router-dom";

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

    // Check if course already has a lecturer
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

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: "success",
      UPCOMING: "warning",
      COMPLETED: "default",
    };
    return variants[status] || "default";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Quản lý Lớp học
              </h1>
              <p className="text-pink-100 mt-1">
                Quản lý các lớp học trong hệ thống
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/admin")}
                className="bg-white bg-opacity-20 text-white hover:bg-opacity-30 border-0"
              >
                ← Quay lại
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-white bg-opacity-30 text-pink-600 hover:bg-pink-50 border-0 shadow-md"
              >
                + Tạo lớp học
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="text-2xl text-gray-800">Danh sách Lớp học</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-gray-600 uppercase text-xs">Mã lớp</TableHead>
                    <TableHead className="font-semibold text-gray-600 uppercase text-xs">Môn học</TableHead>
                    <TableHead className="font-semibold text-gray-600 uppercase text-xs">Học kỳ</TableHead>
                    <TableHead className="font-semibold text-gray-600 uppercase text-xs">Giảng viên</TableHead>
                    <TableHead className="font-semibold text-gray-600 uppercase text-xs">Sinh viên</TableHead>
                    <TableHead className="font-semibold text-gray-600 uppercase text-xs">Trạng thái</TableHead>
                    <TableHead className="font-semibold text-gray-600 uppercase text-xs">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => {
                    const lecturerName = getCourseLecturer(course.id);
                    return (
                      <TableRow
                        key={course.id}
                        className={`hover:bg-pink-100 transition-colors ${courses.indexOf(course) % 2 === 0 ? 'bg-white' : 'bg-pink-50/30'
                          }`}
                      >
                        <TableCell className="font-bold text-pink-600 text-lg">
                          {course.code}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 font-semibold"
                          >
                            {getSubjectCode(course.subjectId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {getSemesterName(course.semesterId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lecturerName || (
                            <span className="text-gray-400 text-sm">
                              Chưa phân công
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <span className="font-semibold text-indigo-600">
                            {course.currentStudents}
                          </span>
                          /{course.maxStudents}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadge(course.status)}
                            className="shadow-sm"
                          >
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!lecturerName && (
                              <Button
                                size="sm"
                                onClick={() => handleAssignLecturer(course)}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-sm"
                              >
                                + GV
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(course)}
                              className="hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300"
                            >
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(course.id)}
                              className="hover:bg-red-50 hover:text-red-700"
                            >
                              Xóa
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
      </div>

      {/* Create/Edit Course Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCourse ? "Sửa lớp học" : "Tạo lớp học mới"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã lớp *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Môn học *
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-md"
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
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
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

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAssignModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
            >
              Phân công
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
