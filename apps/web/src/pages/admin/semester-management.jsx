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

export default function SemesterManagement() {
    const navigate = useNavigate();
    const { success, error } = useToast();
    const [semesters, setSemesters] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingSemester, setEditingSemester] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        status: "UPCOMING",
    });

    useEffect(() => {
        loadSemesters();
    }, []);

    const loadSemesters = () => {
        const data = db.findMany("semesters");
        setSemesters(data);
    };

    const handleCreate = () => {
        setEditingSemester(null);
        setFormData({
            name: "",
            startDate: "",
            endDate: "",
            status: "UPCOMING",
        });
        setShowModal(true);
    };

    const handleEdit = (semester) => {
        setEditingSemester(semester);
        setFormData({
            name: semester.name,
            startDate: semester.startDate,
            endDate: semester.endDate,
            status: semester.status,
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm("Bạn có chắc chắn muốn xóa học kỳ này?")) {
            db.delete("semesters", id);
            success("Xóa học kỳ thành công!");
            loadSemesters();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Auto-generate code from name
        const code = formData.name.toUpperCase().replace(/\s+/g, '');

        if (editingSemester) {
            db.update("semesters", editingSemester.id, { ...formData, code });
            success("Cập nhật học kỳ thành công!");
        } else {
            db.create("semesters", {
                ...formData,
                code,
                createdAt: new Date().toISOString(),
            });
            success("Tạo học kỳ thành công!");
        }

        setShowModal(false);
        loadSemesters();
    };

    const getStatusBadge = (status) => {
        const variants = {
            ACTIVE: "success",
            UPCOMING: "warning",
            COMPLETED: "default",
        };
        return variants[status] || "default";
    };

    const getCourses = (semesterId) => {
        return db.findMany("courses", { semesterId });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Quản lý Học kỳ
                            </h1>
                            <p className="text-indigo-100 mt-1">
                                Quản lý các học kỳ trong hệ thống
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
                                className="bg-white bg-opacity-30 text-indigo-600 hover:bg-indigo-50 border-0 shadow-md"
                            >
                                + Tạo học kỳ
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                        <CardTitle className="text-2xl text-gray-800">Danh sách Học kỳ</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-600 uppercase text-xs">Tên học kỳ</TableHead>
                                        <TableHead className="font-semibold text-gray-600 uppercase text-xs">Ngày bắt đầu</TableHead>
                                        <TableHead className="font-semibold text-gray-600 uppercase text-xs">Ngày kết thúc</TableHead>
                                        <TableHead className="font-semibold text-gray-600 uppercase text-xs">Mã lớp</TableHead>
                                        <TableHead className="font-semibold text-gray-600 uppercase text-xs">Trạng thái</TableHead>
                                        <TableHead className="font-semibold text-gray-600 uppercase text-xs">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {semesters.map((semester) => {
                                        const courses = getCourses(semester.id);
                                        return (
                                            <TableRow
                                                key={semester.id}
                                                className={`hover:bg-indigo-100 transition-colors ${semesters.indexOf(semester) % 2 === 0 ? 'bg-white' : 'bg-indigo-50/30'
                                                    }`}
                                            >
                                                <TableCell className="font-medium text-gray-900">
                                                    {semester.name}
                                                </TableCell>
                                                <TableCell className="text-gray-600">{semester.startDate}</TableCell>
                                                <TableCell className="text-gray-600">{semester.endDate}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {courses.length > 0 ? (
                                                            courses.slice(0, 3).map((course) => (
                                                                <Badge
                                                                    key={course.id}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="mr-1 bg-blue-50 text-blue-700 border-blue-200"
                                                                >
                                                                    {course.code}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">Chưa có lớp</span>
                                                        )}
                                                        {courses.length > 3 && (
                                                            <Badge variant="outline" size="sm" className="bg-gray-100">
                                                                +{courses.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={getStatusBadge(semester.status)}
                                                        className="shadow-sm"
                                                    >
                                                        {semester.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEdit(semester)}
                                                            className="hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
                                                        >
                                                            Sửa
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(semester.id)}
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

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingSemester ? "Sửa học kỳ" : "Tạo học kỳ mới"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên học kỳ *
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày bắt đầu *
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.startDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, startDate: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày kết thúc *
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={formData.endDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, endDate: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                        >
                            {editingSemester ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
