// Lecturer Assignment — Admin Module
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import {
    ChevronRight, UserCog, Search, Plus, X, Users,
    BookOpen, CalendarDays, CheckCircle
} from "lucide-react";

// Feature Hooks
import { useGetCourses, useAssignLecturer, useRemoveLecturer } from "../../features/courses/hooks/useCourses.js";
import { useGetSemesters, useGetSubjects } from "../../features/system/hooks/useSystem.js";
import { useGetUsers } from "../../features/users/hooks/useUsers.js";

export default function LecturerAssignment() {
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    // Data Fetching
    const { data: coursesData = { items: [] }, isLoading: loadingCourses } = useGetCourses();
    const courses = coursesData.items || [];

    const { data: lecturers = [], isLoading: loadingLects } = useGetUsers("LECTURER");
    const { data: semesters = [], isLoading: loadingSems } = useGetSemesters();
    const { data: subjects = [], isLoading: loadingSubs } = useGetSubjects();

    const assignMutation = useAssignLecturer();
    const removeMutation = useRemoveLecturer();

    const [search, setSearch] = useState("");
    const [filterSem, setFilterSem] = useState("");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedLecturer, setSelectedLecturer] = useState("");

    const handleAssign = async () => {
        if (!selectedLecturer || !selectedCourse) {
            showError("Vui lòng chọn giảng viên");
            return;
        }
        try {
            await assignMutation.mutateAsync({
                courseId: selectedCourse.id,
                lecturerUserId: selectedLecturer,
            });
            success("Đã phân công giảng viên thành công");
            setModalOpen(false);
            setSelectedLecturer("");
        } catch (err) {
            showError(err.message || "Không thể phân công giảng viên");
        }
    };

    const handleRemove = async (courseId, lecturerId, lecturerName) => {
        if (!confirm(`Xóa phân công GV. ${lecturerName} khỏi lớp này?`)) return;
        try {
            await removeMutation.mutateAsync({
                courseId,
                lecturerUserId: lecturerId,
            });
            success("Đã xóa phân công");
        } catch (err) {
            showError(err.message || "Không thể xóa phân công");
        }
    };

    const isLoading = loadingCourses || loadingLects || loadingSems || loadingSubs;

    const filtered = courses.filter(c => {
        const matchSearch = !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.name?.toLowerCase().includes(search.toLowerCase());
        const matchSem = !filterSem || String(c.semesterId) === String(filterSem);
        return matchSearch && matchSem;
    });

    const totalAssignedCount = courses.reduce((acc, c) => acc + (c.lecturers?.length || 0), 0);
    const unassignedCount = courses.filter(c => (c.lecturers?.length || 0) === 0).length;

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                <span className="text-teal-700 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/admin")}>Admin</span>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-semibold">Phân công Giảng viên</span>
            </nav>

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Phân công Giảng viên</h2>
                <p className="text-sm text-gray-500 mt-0.5">Gán giảng viên phụ trách các lớp học phần</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl px-4 py-3 border border-blue-100 bg-blue-50 flex items-center justify-between text-blue-700">
                    <span className="text-xs font-semibold">Tổng lớp</span>
                    <span className="text-xl font-bold">{courses.length}</span>
                </div>
                <div className="rounded-2xl px-4 py-3 border border-green-100 bg-green-50 flex items-center justify-between text-green-700">
                    <span className="text-xs font-semibold">Đã phân công</span>
                    <span className="text-xl font-bold">{totalAssignedCount}</span>
                </div>
                <div className="rounded-2xl px-4 py-3 border border-orange-100 bg-orange-50 flex items-center justify-between text-orange-600">
                    <span className="text-xs font-semibold">Chưa phân công</span>
                    <span className="text-xl font-bold">{unassignedCount}</span>
                </div>
            </div>

            {/* Filters */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <CardContent className="p-5 flex flex-wrap gap-4 items-end">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm lớp học..."
                            className="pl-9 pr-4 py-2.5 w-full bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                        />
                    </div>
                    <div className="min-w-[180px]">
                        <select
                            value={filterSem}
                            onChange={e => setFilterSem(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                        >
                            <option value="">Tất cả học kỳ</option>
                            {semesters.map(s => <option key={s.id} value={s.id}>{s.code} – {s.name}</option>)}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Course + Lecturer table */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Lớp học phần</div>
                    <div className="col-span-2 text-center hidden md:block">Môn / Kỳ</div>
                    <div className="col-span-4">Giảng viên phụ trách</div>
                    <div className="col-span-2 text-right">Thao tác</div>
                </div>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-20 text-center text-gray-400 font-medium">Đang tải dữ liệu...</div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-2">
                            <BookOpen size={28} className="text-gray-300" />
                            <p className="text-sm text-gray-400">Không tìm thấy lớp học</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filtered.map(course => {
                                const assigned = course.lecturers || [];
                                return (
                                    <div key={course.id} className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                                        <div className="col-span-4">
                                            <p className="font-semibold text-sm text-gray-800">{course.code}</p>
                                            <p className="text-xs text-gray-400 truncate">{course.name}</p>
                                        </div>
                                        <div className="col-span-2 text-center hidden md:block">
                                            <p className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                                                {subjects.find(s => String(s.id) === String(course.subjectId))?.code}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                {semesters.find(s => String(s.id) === String(course.semesterId))?.name}
                                            </p>
                                        </div>
                                        <div className="col-span-4 flex flex-wrap gap-2 items-center">
                                            {assigned.length === 0 ? (
                                                <span className="text-xs text-gray-400 italic">Chưa phân công</span>
                                            ) : assigned.map(lect => (
                                                <div key={lect.id} className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    <div className="w-4 h-4 rounded-full bg-teal-200 flex items-center justify-center text-[9px] font-bold">
                                                        {lect.name?.charAt(0)}
                                                    </div>
                                                    {lect.name}
                                                    <button
                                                        onClick={() => handleRemove(course.id, lect.id, lect.name)}
                                                        className="text-teal-400 hover:text-red-500 transition-colors ml-0.5"
                                                    >
                                                        <X size={11} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <button
                                                onClick={() => { setSelectedCourse(course); setSelectedLecturer(""); setModalOpen(true); }}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl px-3 py-1.5 border border-teal-100 transition-colors"
                                            >
                                                <Plus size={12} />Phân công
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Assign Modal ─────────────────── */}
            {modalOpen && selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-[28px] shadow-2xl p-6 w-full max-w-sm mx-4">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-800">Phân công Giảng viên</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500 font-medium">Lớp học phần</p>
                            <p className="text-sm font-bold text-gray-800">{selectedCourse.code} — {selectedCourse.name}</p>
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chọn giảng viên</label>
                            <select
                                value={selectedLecturer}
                                onChange={e => setSelectedLecturer(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                            >
                                <option value="">— Chọn giảng viên —</option>
                                {lecturers.map(l => <option key={l.id} value={l.id}>{l.name} ({l.email})</option>)}
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setModalOpen(false)}
                                variant="outline"
                                className="flex-1 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 h-10"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleAssign}
                                disabled={!selectedLecturer}
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 border-0 shadow-sm disabled:opacity-50"
                            >
                                <CheckCircle size={14} className="mr-2" />Xác nhận
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
