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
import { CalendarDays, PlayCircle, AlertCircle, CheckCircle } from "lucide-react";
import {
    useGetSemesters,
    useCreateSemester,
    useUpdateSemester,
    useDeleteSemester
} from "../../features/system/hooks/useSystem.js";
import { useGetCourses } from "../../features/courses/hooks/useCourses.js";

export default function SemesterManagement() {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    // Data Fetching
    const { data: semesters = [], isLoading: loadingSemesters } = useGetSemesters();
    const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses({ pageSize: 1000 });
    const allCourses = coursesData.items || [];

    const createMutation = useCreateSemester();
    const updateMutation = useUpdateSemester();
    const deleteMutation = useDeleteSemester();

    const [showModal, setShowModal] = useState(false);
    const [editingSemester, setEditingSemester] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        status: "UPCOMING",
    });

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
        
        // Ensure format is YYYY-MM-DD for HTML input[type="date"]
        const formatForInput = (dateStr) => {
            if (!dateStr || dateStr.startsWith('0001')) return "";
            return dateStr.split('T')[0];
        };

        setFormData({
            name: semester.name || "",
            startDate: formatForInput(semester.startDate),
            endDate: formatForInput(semester.endDate),
            status: semester.status || "ACTIVE",
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Bạn có chắc chắn muốn xóa học kỳ này?")) {
            try {
                await deleteMutation.mutateAsync(id);
                success("Xóa học kỳ thành công!");
            } catch (err) {
                showError(err.message || "Xóa thất bại");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // And use all formats since C# might be strict on Data Transfer Object
        const finalStartDate = formData.startDate.includes('T') ? formData.startDate : `${formData.startDate}T00:00:00Z`;
        const finalEndDate = formData.endDate.includes('T') ? formData.endDate : `${formData.endDate}T23:59:59Z`;
        
        const formattedPayload = {
            id: editingSemester ? editingSemester.id : undefined,
            Id: editingSemester ? editingSemester.id : undefined,
            name: formData.name,
            Name: formData.name,
            code: code,
            Code: code,
            semester_code: code,
            startDate: finalStartDate,
            StartDate: finalStartDate,
            start_date: finalStartDate,
            endDate: finalEndDate,
            EndDate: finalEndDate,
            end_date: finalEndDate,
            status: formData.status,
            Status: formData.status
        };

        try {
            if (editingSemester) {
                await updateMutation.mutateAsync({ id: editingSemester.id, updates: formattedPayload });
                success("Cập nhật học kỳ thành công!");
            } else {
                await createMutation.mutateAsync(formattedPayload);
                success("Tạo học kỳ thành công!");
            }
            setShowModal(false);
        } catch (err) {
            showError(err.message || "Thao tác thất bại");
        }
    };

    const getCoursesForSemester = (semesterId) => {
        return allCourses.filter(c => c.semesterId === semesterId);
    };

    return (
        <div className="space-y-6">
            {/* Top Stats Cards - Edaca Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-inner">
                        <CalendarDays size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tổng số học kỳ</p>
                        <h3 className="text-2xl font-bold text-gray-800">{semesters.length}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center shrink-0 shadow-inner">
                        <PlayCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Đang diễn ra</p>
                        <h3 className="text-2xl font-bold text-gray-800">{semesters.filter(s => s.status === 'ACTIVE').length}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-inner">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Sắp tới</p>
                        <h3 className="text-2xl font-bold text-gray-800">{semesters.filter(s => s.status === 'UPCOMING').length}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-14 h-14 rounded-2xl bg-gray-400 text-white flex items-center justify-center shrink-0 shadow-inner">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Đã kết thúc</p>
                        <h3 className="text-2xl font-bold text-gray-800">{semesters.filter(s => s.status === 'COMPLETED').length}</h3>
                    </div>
                </div>
            </div>

            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 pb-4 pt-6 px-6">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl text-gray-800 font-bold">Danh sách Học kỳ</CardTitle>
                        <Button
                            onClick={handleCreate}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm h-10 px-5"
                        >
                            + Thêm Học kỳ
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {(loadingSemesters || loadingCourses) ? (
                        <div className="py-20 text-center text-gray-400">Đang tải dữ liệu...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow className="border-b border-gray-100/50 hover:bg-transparent">
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Tên học kỳ</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Thời gian</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Các lớp học</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</TableHead>
                                        <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-50">
                                    {semesters.map((semester) => {
                                        const courses = getCoursesForSemester(semester.id);
                                        return (
                                            <TableRow key={semester.id} className="hover:bg-gray-50/50 transition-colors border-none group">
                                                <TableCell className="py-4 px-6 text-center">
                                                    <span className="font-semibold text-gray-800 text-sm">{semester.name}</span>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center">
                                                    <div className="text-sm text-gray-600 font-medium">
                                                        {(!semester.startDate || semester.startDate.startsWith('0001')) ? "Chưa xác định" : new Date(semester.startDate).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {(!semester.endDate || semester.endDate.startsWith('0001')) ? "Chưa xác định" : new Date(semester.endDate).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center">
                                                    <div className="flex flex-wrap justify-center gap-1">
                                                        {courses.length > 0 ? (
                                                            <>
                                                                {courses.slice(0, 3).map((course) => (
                                                                    <span
                                                                        key={course.id}
                                                                        className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50"
                                                                    >
                                                                        {course.code}
                                                                    </span>
                                                                ))}
                                                                {courses.length > 3 && (
                                                                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200/50">
                                                                        +{courses.length - 3}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 font-medium italic">Chưa có lớp</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider inline-block whitespace-nowrap ${semester.status === 'ACTIVE' ? 'text-green-600 bg-green-50' :
                                                        semester.status === 'UPCOMING' ? 'text-blue-600 bg-blue-50' :
                                                            'text-gray-600 bg-gray-100'
                                                        }`}>
                                                        {semester.status === 'ACTIVE' ? 'ĐANG DIỄN RA' : semester.status === 'UPCOMING' ? 'SẮP TỚI' : 'ĐÃ KẾT THÚC'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-center">
                                                    <div className="flex items-center justify-center gap-2 transition-opacity min-w-[120px]">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEdit(semester)}
                                                            className="h-8 w-8 p-0 rounded-lg text-blue-600 border-blue-200/50 hover:bg-blue-50 hover:border-blue-300"
                                                            title="Sửa"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDelete(semester.id)}
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
                                Ngày bắt đầu *
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
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
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
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
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({ ...formData, status: e.target.value })
                            }
                        >
                            <option value="UPCOMING">Sắp tới (UPCOMING)</option>
                            <option value="ACTIVE">Đang diễn ra (ACTIVE)</option>
                            <option value="COMPLETED">Đã kết thúc (COMPLETED)</option>
                        </select>
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
                            {editingSemester ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
