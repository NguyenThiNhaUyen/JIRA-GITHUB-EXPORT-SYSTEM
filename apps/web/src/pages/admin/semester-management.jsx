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
import { CalendarDays, PlayCircle, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { SmartDatePicker } from "../../components/ui/smart-date-picker.jsx";

// Parse "SPRING2026" / legacy names → season + year for the form controls
const parseSemesterNameParts = (name) => {
    const fallbackYear = new Date().getFullYear();
    if (!name || typeof name !== "string") {
        return { season: "SPRING", year: fallbackYear };
    }
    const compact = name.toUpperCase().replace(/\s+/g, "");
    const m = /^(SPRING|SUMMER|FALL)(\d{4})$/.exec(compact);
    if (m) {
        return { season: m[1], year: parseInt(m[2], 10) };
    }
    return { season: "SPRING", year: fallbackYear };
};

// Helper: format ISO date → "dd thg MM, yyyy"
const fmtDate = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('vi-VN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch { return iso; }
};
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
    const [semesterSeason, setSemesterSeason] = useState("SPRING");
    const [semesterYear, setSemesterYear] = useState(() => new Date().getFullYear());

    const handleCreate = () => {
        setEditingSemester(null);
        setSemesterSeason("SPRING");
        setSemesterYear(new Date().getFullYear());
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
        const { season, year } = parseSemesterNameParts(semester.name);
        setSemesterSeason(season);
        setSemesterYear(year);
        const startDate = semester.startDate ? semester.startDate.toString().split("T")[0] : "";
        const endDate = semester.endDate ? semester.endDate.toString().split("T")[0] : "";
        setFormData({
            name: semester.name,
            startDate,
            endDate,
            status: semester.status,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const semesterCourses = getCoursesForSemester(id);
        const semesterName = semesters.find(s => s.id === id)?.name || "học kỳ này";

        if (semesterCourses.length > 0) {
            showError(`Không thể xóa! Học kỳ "${semesterName}" đang có ${semesterCourses.length} lớp học đang hoạt động.`);
            return;
        }

        if (window.confirm(`Bạn có chắc và muốn xóa "${semesterName}"? Dữ liệu này không thể khôi phục.`)) {
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
        
        // BUG-55: Robust Date Validation (Stress Test Protection)
        if (!formData.startDate || !formData.endDate) {
            showError("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc");
            return;
        }
        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            showError("Ngày kết thúc phải lớn hơn ngày bắt đầu");
            return;
        }

        const y = Number(semesterYear);
        if (!Number.isFinite(y) || y < 2000 || y > 2100) {
            showError("Vui lòng nhập năm hợp lệ (2000–2100)");
            return;
        }

        const name = `${semesterSeason}${y}`;
        const code = name.toUpperCase().replace(/\s+/g, "");
        const status = editingSemester ? formData.status : "UPCOMING";

        try {
            if (editingSemester) {
                await updateMutation.mutateAsync({
                    id: editingSemester.id,
                    updates: { ...formData, name, code, status },
                });
                success("Cập nhật học kỳ thành công!");
            } else {
                await createMutation.mutateAsync({ ...formData, name, code, status });
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
                                                    <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                                                        <CalendarDays size={13} className="text-blue-400 shrink-0" />
                                                        <span>{fmtDate(semester.startDate)}</span>
                                                        <ArrowRight size={12} className="text-gray-300" />
                                                        <span>{fmtDate(semester.endDate)}</span>
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
                            Tên học kỳ <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-row gap-3 items-stretch">
                            <select
                                className="flex-1 min-w-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={semesterSeason}
                                onChange={(e) => setSemesterSeason(e.target.value)}
                                required
                            >
                                <option value="SPRING">SPRING</option>
                                <option value="SUMMER">SUMMER</option>
                                <option value="FALL">FALL</option>
                            </select>
                            <input
                                type="number"
                                min={2000}
                                max={2100}
                                className="w-28 shrink-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={semesterYear}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setSemesterYear(v === "" ? "" : Number(v));
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <SmartDatePicker
                            startDate={formData.startDate}
                            endDate={formData.endDate}
                            onChange={({ startDate, endDate }) =>
                                setFormData({ ...formData, startDate, endDate })
                            }
                        />
                    </div>

                    {/* Trạng thái — chỉ hiển thị, tự động theo ngày */}
                    <div className="bg-gray-50/60 border border-gray-100 rounded-xl p-4 text-sm text-gray-600">
                        Trạng thái:{" "}
                        <span className={`font-bold ${
                            formData.status === "ACTIVE" ? "text-green-600"
                            : formData.status === "UPCOMING" ? "text-blue-600"
                            : "text-gray-500"
                        }`}>
                            {formData.status === "ACTIVE" ? "Đang diễn ra (ACTIVE)"
                                : formData.status === "UPCOMING" ? "Sắp tới (UPCOMING)"
                                : "Đã kết thúc (COMPLETED)"}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">Trạng thái được tính tự động theo ngày bắt đầu/kết thúc.</p>
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
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className={`bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm ${
                                (createMutation.isPending || updateMutation.isPending) ? "opacity-50" : ""
                            }`}
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? "Đang xử lý..." : (editingSemester ? "Cập nhật" : "Tạo mới")}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
