// Manage Groups - Enterprise UI (logic unchanged)
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import db from "../../mock/db.js";
import {
    ChevronRight, UserPlus, Users, GitBranch, BookOpen,
    Trash2, Eye, PenLine, ArrowLeft
} from "lucide-react";

export default function ManageGroups() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error } = useToast();

    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [newGroupTopic, setNewGroupTopic] = useState("");

    useEffect(() => { loadCourseData(); }, [courseId]);

    const loadCourseData = () => {
        try {
            const courseData = db.findById("courses", courseId);
            setCourse(courseData);
            const enrollments = db.findMany("courseEnrollments", { courseId });
            const courseStudents = enrollments
                .map((e) => db.findById("users.students", e.studentId))
                .filter(Boolean);
            setStudents(courseStudents);
            const courseGroups = db.getCourseGroups(courseId);
            setGroups(courseGroups);
        } catch (err) {
            error("Không thể tải dữ liệu lớp học");
        }
    };

    const handleCreateGroup = () => {
        if (selectedStudents.length === 0) { error("Vui lòng chọn ít nhất 1 học sinh"); return; }
        if (!newGroupTopic.trim()) { error("Vui lòng nhập đề tài cho nhóm"); return; }
        try {
            const newGroup = {
                courseId,
                name: `Nhóm ${groups.length + 1}`,
                topic: newGroupTopic,
                studentIds: selectedStudents,
                teamLeaderId: selectedStudents[0],
                githubRepoUrl: null, jiraProjectUrl: null,
                githubStatus: "PENDING", jiraStatus: "PENDING",
                approvedByLecturerId: null, approvedAt: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            db.create("groups", newGroup);
            success(`Đã tạo nhóm "${newGroup.name}"`);
            setSelectedStudents([]);
            setNewGroupTopic("");
            loadCourseData();
        } catch (err) {
            error("Không thể tạo nhóm");
        }
    };

    const handleDeleteGroup = (groupId) => {
        if (!confirm("Bạn có chắc muốn xóa nhóm này?")) return;
        try {
            db.delete("groups", groupId);
            success("Đã xóa nhóm");
            loadCourseData();
        } catch (err) {
            error("Không thể xóa nhóm");
        }
    };

    const handleUpdateGroupTopic = (groupId, newTopic) => {
        try {
            db.update("groups", groupId, { topic: newTopic, updatedAt: new Date().toISOString() });
            success("Đã cập nhật đề tài");
            loadCourseData();
        } catch (err) {
            error("Không thể cập nhật đề tài");
        }
    };

    const handleRemoveStudentFromGroup = (groupId, studentId) => {
        try {
            const group = db.findById("groups", groupId);
            const updatedStudentIds = group.studentIds.filter((id) => id !== studentId);
            db.update("groups", groupId, { studentIds: updatedStudentIds, updatedAt: new Date().toISOString() });
            success("Đã xóa học sinh khỏi nhóm");
            loadCourseData();
        } catch (err) {
            error("Không thể xóa học sinh");
        }
    };

    const toggleStudentSelection = (studentId) =>
        setSelectedStudents((prev) =>
            prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
        );

    const assignedStudentIds = new Set(groups.flatMap((g) => g.studentIds));
    const availableStudents = students.filter((s) => !assignedStudentIds.has(s.id));

    return (
        <div className="space-y-6">

            {/* ── Breadcrumb + page header ─────────────── */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <button
                            onClick={() => navigate("/lecturer")}
                            className="text-teal-700 font-semibold hover:underline"
                        >
                            Giảng viên
                        </button>
                        <ChevronRight size={12} />
                        <span className="text-gray-600">Quản lý Nhóm</span>
                        {course && (
                            <>
                                <ChevronRight size={12} />
                                <span className="text-gray-800 font-semibold">{course.code}</span>
                            </>
                        )}
                    </nav>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-800">Quản lý Nhóm</h2>
                        {course && (
                            <p className="text-sm text-gray-500 mt-0.5">{course.code} — {course.name}</p>
                        )}
                    </div>
                </div>
                <Button
                    onClick={() => navigate("/lecturer")}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl h-9 px-4 text-sm"
                >
                    <ArrowLeft size={14} />
                    Quay lại
                </Button>
            </div>

            {/* ── Stats row ────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
                <MiniStat label="Tổng học sinh" value={students.length} color="text-blue-600 bg-blue-50" />
                <MiniStat label="Chưa phân nhóm" value={availableStudents.length} color="text-orange-600 bg-orange-50" />
                <MiniStat label="Nhóm hiện có" value={groups.length} color="text-teal-600 bg-teal-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* ── Left: Create Group Form ───────────── */}
                <div className="lg:col-span-2">
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white h-full">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                                    <UserPlus size={15} className="text-teal-600" />
                                </div>
                                <CardTitle className="text-base font-semibold text-gray-800">Tạo Nhóm Mới</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-5">
                            {/* Topic input */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Đề tài nhóm
                                </label>
                                <input
                                    type="text"
                                    value={newGroupTopic}
                                    onChange={(e) => setNewGroupTopic(e.target.value)}
                                    placeholder="Nhập đề tài cho nhóm..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Student checklist */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Học sinh chưa phân nhóm
                                    </label>
                                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                                        {availableStudents.length} có sẵn
                                    </span>
                                </div>
                                <div className="border border-gray-100 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                                    {availableStudents.length === 0 ? (
                                        <div className="px-4 py-6 text-center">
                                            <p className="text-xs text-gray-400">Tất cả học sinh đã được phân nhóm</p>
                                        </div>
                                    ) : (
                                        availableStudents.map((student) => (
                                            <label
                                                key={student.id}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={() => toggleStudentSelection(student.id)}
                                                    className="w-4 h-4 rounded text-teal-600 border-gray-300 focus:ring-teal-400"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">{student.name}</p>
                                                    <p className="text-xs text-gray-400">{student.studentId}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {selectedStudents.length > 0 && (
                                    <p className="text-xs text-teal-600 font-medium mt-2">
                                        Đã chọn {selectedStudents.length} học sinh
                                    </p>
                                )}
                            </div>

                            <Button
                                onClick={handleCreateGroup}
                                disabled={selectedStudents.length === 0 || !newGroupTopic.trim()}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 font-semibold text-sm shadow-sm border-0 transition-all focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:opacity-50"
                            >
                                + Tạo nhóm
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right: Groups List ────────────────── */}
                <div className="lg:col-span-3">
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Users size={15} className="text-blue-600" />
                                    </div>
                                    <CardTitle className="text-base font-semibold text-gray-800">
                                        Danh sách Nhóm
                                    </CardTitle>
                                </div>
                                <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-3 py-1 font-medium">
                                    {groups.length} nhóm
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {groups.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                                        <Users size={20} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-400">Chưa có nhóm nào</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {groups.map((group) => {
                                        const groupStudents = db.getGroupStudents(group.id);
                                        return (
                                            <div key={group.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                                                {/* Group header row */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-gray-900">{group.name}</h3>
                                                            <StatusBadge status={group.githubStatus} icon={<GitBranch size={9} />} label="GitHub" />
                                                            <StatusBadge status={group.jiraStatus} icon={<BookOpen size={9} />} label="Jira" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            onClick={() => navigate(`/lecturer/group/${group.id}`)}
                                                            className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg px-2.5 py-1.5 transition-colors border border-teal-100"
                                                        >
                                                            <Eye size={11} />Chi tiết
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteGroup(group.id)}
                                                            className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg px-2.5 py-1.5 transition-colors border border-red-100"
                                                        >
                                                            <Trash2 size={11} />Xóa
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Topic input inline */}
                                                <div className="mb-3">
                                                    <label className="block text-xs text-gray-400 font-medium mb-1 flex items-center gap-1">
                                                        <PenLine size={10} /> Đề tài
                                                    </label>
                                                    <input
                                                        type="text"
                                                        defaultValue={group.topic}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== group.topic)
                                                                handleUpdateGroupTopic(group.id, e.target.value);
                                                        }}
                                                        placeholder="Chưa có đề tài..."
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                {/* Members */}
                                                <div>
                                                    <label className="block text-xs text-gray-400 font-medium mb-2">
                                                        Thành viên ({groupStudents.length})
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {groupStudents.map((student) => (
                                                            <div
                                                                key={student.id}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium text-gray-700 shadow-sm"
                                                            >
                                                                <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[9px] font-bold">
                                                                    {student.name?.charAt(0)}
                                                                </div>
                                                                {student.name}
                                                                {student.id === group.teamLeaderId && (
                                                                    <span className="text-[9px] font-bold text-teal-600 uppercase">★</span>
                                                                )}
                                                                <button
                                                                    onClick={() => handleRemoveStudentFromGroup(group.id, student.id)}
                                                                    className="text-gray-300 hover:text-red-500 transition-colors ml-0.5 font-bold"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* ─── Sub-components ─────────────────────────────────────── */
function MiniStat({ label, value, color }) {
    return (
        <div className={`rounded-2xl px-4 py-3 ${color} flex items-center justify-between`}>
            <span className="text-xs font-semibold opacity-80">{label}</span>
            <span className="text-xl font-bold">{value}</span>
        </div>
    );
}

function StatusBadge({ status, icon, label }) {
    const approved = status === "APPROVED";
    return (
        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${approved ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
            }`}>
            {icon}{label}{approved ? " ✓" : ""}
        </span>
    );
}
