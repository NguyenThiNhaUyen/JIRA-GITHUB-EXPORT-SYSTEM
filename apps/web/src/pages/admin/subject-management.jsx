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
import { Badge } from "../../components/ui/badge.jsx";
import db from "../../mock/db.js";
import { useToast } from "../../components/ui/toast.jsx";
import { useNavigate } from "react-router-dom";

export default function SubjectManagement() {
    const navigate = useNavigate();
    const { success, error } = useToast();
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [showCoursesModal, setShowCoursesModal] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
    });

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = () => {
        const data = db.findMany("subjects");
        setSubjects(data);
    };

    const handleCreate = () => {
        setEditingSubject(null);
        setFormData({
            code: "",
            name: "",
        });
        setShowModal(true);
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setFormData({
            code: subject.code,
            name: subject.name,
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm("Bạn có chắc chắn muốn xóa môn học này?")) {
            db.delete("subjects", id);
            success("Xóa môn học thành công!");
            loadSubjects();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingSubject) {
            db.update("subjects", editingSubject.id, formData);
            success("Cập nhật môn học thành công!");
        } else {
            db.create("subjects", {
                ...formData,
                createdAt: new Date().toISOString(),
            });
            success("Tạo môn học thành công!");
        }

        setShowModal(false);
        loadSubjects();
    };

    const getCourses = (subjectId) => {
        return db.findMany("courses", { subjectId });
    };

    const handleViewCourses = (subject) => {
        const courses = getCourses(subject.id);
        setSelectedCourses(courses);
        setShowCoursesModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Quản lý Môn học
                            </h1>
                            <p className="text-purple-100 mt-1">
                                Quản lý các môn học trong hệ thống
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
                                className="bg-white bg-opacity-30 text-purple-600 hover:bg-purple-50 border-0 shadow-md"
                            >
                                + Tạo môn học
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                        <CardTitle className="text-2xl text-gray-800">Danh sách Môn học</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-600 uppercase text-xs">Mã môn học</TableHead>
                                        <TableHead className="font-semibold text-gray-600 uppercase text-xs">Tên môn học</TableHead>
                                        <TableHead className="font-semibold text-gray-600 uppercase text-xs">Danh sách lớp học</TableHead>
                                        <TableHead className="font-semibold text-gray-600 uppercase text-xs">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subjects.map((subject) => {
                                        const courses = getCourses(subject.id);
                                        return (
                                            <TableRow
                                                key={subject.id}
                                                className={`hover:bg-purple-100 transition-colors ${subjects.indexOf(subject) % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'
                                                    }`}
                                            >
                                                <TableCell className="font-bold text-purple-600 text-lg">
                                                    {subject.code}
                                                </TableCell>
                                                <TableCell className="font-medium text-gray-900">
                                                    {subject.name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {courses.length > 0 ? (
                                                            <div>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {courses.slice(0, 4).map((course) => (
                                                                        <Badge
                                                                            key={course.id}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="bg-purple-50 text-purple-700 border-purple-200"
                                                                        >
                                                                            {course.code}
                                                                        </Badge>
                                                                    ))}
                                                                    {courses.length > 4 && (
                                                                        <button
                                                                            onClick={() => handleViewCourses(subject)}
                                                                            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                                                                        >
                                                                            +{courses.length - 4} lớp
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">Chưa có lớp học</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEdit(subject)}
                                                            className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                                                        >
                                                            Sửa
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(subject.id)}
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

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingSubject ? "Sửa môn học" : "Tạo môn học mới"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mã môn học *
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            value={formData.code}
                            onChange={(e) =>
                                setFormData({ ...formData, code: e.target.value.toUpperCase() })
                            }
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Ví dụ: EXE101, PRN222, SWD302</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên môn học *
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
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
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
                        >
                            {editingSubject ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* View Courses Modal */}
            <Modal
                isOpen={showCoursesModal}
                onClose={() => setShowCoursesModal(false)}
                title="Danh sách lớp học"
                size="md"
            >
                <div className="space-y-3">
                    {selectedCourses.map((course) => (
                        <div
                            key={course.id}
                            className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                        >
                            <div>
                                <div className="font-bold text-purple-700">{course.code}</div>
                                <div className="text-sm text-gray-600">{course.name}</div>
                            </div>
                            <Badge variant={course.status === "ACTIVE" ? "success" : "default"}>
                                {course.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
