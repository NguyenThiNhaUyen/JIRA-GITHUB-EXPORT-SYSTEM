// Manage Groups - Enterprise UI (Real API)
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import {
    ChevronRight, UserPlus, Users, GitBranch, BookOpen,
    Trash2, Eye, PenLine, ArrowLeft, Star
} from "lucide-react";

// Feature Hooks
import { useGetCourseById, useGetEnrolledStudents } from "../../features/courses/hooks/useCourses.js";
import {
    useCreateProject,
    useDeleteProject,
    useUpdateProject,
    useAddTeamMember,
    useRemoveTeamMember,
    useUpdateTeamMember
} from "../../features/projects/hooks/useProjects.js";

export default function ManageGroups() {
    const { courseId: paramId } = useParams();
    const courseId = paramId;
    const navigate = useNavigate();
    const { success, error } = useToast();

    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedLeaderId, setSelectedLeaderId] = useState(null);
    const [newGroupTopic, setNewGroupTopic] = useState("");

    const [showForceAddModal, setShowForceAddModal] = useState(false);
    const [forceAddGroupId, setForceAddGroupId] = useState(null);
    const [forceAddSelectedIds, setForceAddSelectedIds] = useState([]);

    // Data Fetching
    const { data: course, isLoading: loadingCourse } = useGetCourseById(courseId);
    const { data: studentsData = { items: [] }, isLoading: loadingStudents } = useGetEnrolledStudents(courseId);

    // Mutations
    const createProjectMutation = useCreateProject();
    const deleteProjectMutation = useDeleteProject();
    const updateProjectMutation = useUpdateProject();
    const addTeamMemberMutation = useAddTeamMember();
    const removeTeamMemberMutation = useRemoveTeamMember();
    const updateTeamMemberMutation = useUpdateTeamMember();

    const students = studentsData.items || [];
    const groups = course?.groups || [];

    const handleCreateGroup = async () => {
        if (selectedStudents.length === 0) { error("Vui lòng chọn ít nhất 1 học sinh"); return; }
        if (!newGroupTopic.trim()) { error("Vui lòng nhập đề tài cho nhóm"); return; }

        try {
            const project = await createProjectMutation.mutateAsync({
                courseId: parseInt(courseId),
                name: `Nhóm ${groups.length + 1}`,
                description: newGroupTopic,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // Default 3 months
            });

            // Add selected members
            for (const studentId of selectedStudents) {
                await addTeamMemberMutation.mutateAsync({
                    projectId: project.id,
                    studentId,
                    role: studentId === selectedLeaderId ? "LEADER" : "MEMBER"
                });
            }

            success(`Đã tạo nhóm "${project.name}"`);
            setSelectedStudents([]);
            setSelectedLeaderId(null);
            setNewGroupTopic("");
        } catch (err) {
            error("Không thể tạo nhóm: " + (err.message || "Lỗi hệ thống"));
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!confirm("Bạn có chắc muốn xóa nhóm này?")) return;
        try {
            await deleteProjectMutation.mutateAsync(groupId);
            success("Đã xóa nhóm");
        } catch (err) {
            error("Không thể xóa nhóm");
        }
    };

    const handleUpdateGroupTopic = async (groupId, newTopic) => {
        const currentGroup = groups.find(g => g.id === groupId);
        try {
            await updateProjectMutation.mutateAsync({
                id: groupId,
                body: {
                    name: currentGroup?.name || `Nhóm ${groupId}`,
                    description: newTopic
                }
            });
            success("Đã cập nhật đề tài");
        } catch (err) {
            error("Không thể cập nhật đề tài");
        }
    };
    const handleRemoveStudentFromGroup = async (groupId, studentId) => {
        try {
            await removeTeamMemberMutation.mutateAsync({ projectId: groupId, studentId });
            success("Đã xóa học sinh khỏi nhóm");
        } catch (err) {
            error("Không thể xóa học sinh");
        }
    };

    const handlePromoteLeader = async (groupId, studentId, studentName) => {
        if (!confirm(`Bạn có chắc muốn chỉ định ${studentName} làm Trưởng nhóm mới?`)) return;
        try {
            await updateTeamMemberMutation.mutateAsync({
                projectId: groupId,
                studentId,
                updates: { role: "LEADER" }
            });
            success(`Đã chỉ định ${studentName} làm Trưởng nhóm.`);
        } catch (err) {
            error("Không thể chuyển quyền trưởng nhóm: " + (err.message || "Lỗi hệ thống"));
        }
    };

    const toggleStudentSelection = (studentId) =>
        setSelectedStudents((prev) => {
            const isRemoving = prev.includes(studentId);
            if (isRemoving) {
                if (selectedLeaderId === studentId) setSelectedLeaderId(null);
                return prev.filter((id) => id !== studentId);
            } else {
                // If no leader selected and this is first student, auto-set as leader
                if (!selectedLeaderId) setSelectedLeaderId(studentId);
                return [...prev, studentId];
            }
        });

    // Calculate students not in any group
    const assignedStudentIds = new Set(groups.flatMap((g) => (g.team || []).map(m => m.studentId)));
    const availableStudents = students.filter((s) => !assignedStudentIds.has(s.id));

    const handleOpenForceAdd = (groupId) => {
        setForceAddGroupId(groupId);
        setForceAddSelectedIds([]);
        setShowForceAddModal(true);
    };

    const toggleForceAddStudent = (studentId) => {
        setForceAddSelectedIds((prev) =>
            prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
        );
    };

    const handleForceAddSubmit = async () => {
        if (forceAddSelectedIds.length === 0) {
            error("Vui lòng chọn ít nhất 1 học sinh");
            return;
        }
        try {
            for (const studentId of forceAddSelectedIds) {
                await addTeamMemberMutation.mutateAsync({
                    projectId: forceAddGroupId,
                    studentId,
                    role: "MEMBER"
                });
            }
            success(`Đã thêm ${forceAddSelectedIds.length} học sinh vào nhóm`);
            setShowForceAddModal(false);
        } catch (err) {
            error("Không thể thêm học sinh");
        }
    };

    if (!courseId) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
                    <Users size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Quản lý nhóm</h2>
                <p className="text-sm text-gray-500 mt-2 max-w-sm">
                    Vui lòng chọn lớp học từ menu "Lớp của tôi" hoặc trang Dashboard để bắt đầu quản lý nhóm và thành viên.
                </p>
                <Button 
                    variant="outline" 
                    className="mt-6 rounded-xl border-teal-200 text-teal-700 hover:bg-teal-50"
                    onClick={() => navigate(-1)}
                >
                     Quay lại Dashboard
                </Button>
            </div>
        );
    }

    if (loadingCourse || loadingStudents) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
                <p className="text-gray-500 font-medium">Đang tải dữ liệu nhóm...</p>
            </div>
        );
    }


    return (
        <div className="space-y-6">

            {/* ── Breadcrumb + page header ─────────────── */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <button
                            onClick={() => navigate(-1)}
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
                    onClick={() => navigate(-1)}
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
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-700">{student.name}</p>
                                                    <p className="text-xs text-gray-400">{student.studentId}</p>
                                                </div>

                                                {selectedStudents.includes(student.id) && (
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedLeaderId(student.id); }}
                                                        className={`p-1.5 rounded-lg transition-all ${selectedLeaderId === student.id ? 'bg-amber-100 text-amber-600' : 'text-gray-300 hover:text-amber-400'}`}
                                                        title="Chọn làm Trưởng nhóm"
                                                    >
                                                        <Star size={14} fill={selectedLeaderId === student.id ? "currentColor" : "none"} />
                                                    </button>
                                                )}
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
                                        const groupStudents = group.team || [];
                                        return (
                                            <div key={group.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                                                {/* Group header row */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-gray-900">{group.name}</h3>
                                                            <StatusBadge status={group.integration?.githubStatus} icon={<GitBranch size={9} />} label="GitHub" />
                                                            <StatusBadge status={group.integration?.jiraStatus} icon={<BookOpen size={9} />} label="Jira" />
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
                                                        defaultValue={group.description}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== group.description)
                                                                handleUpdateGroupTopic(group.id, e.target.value);
                                                        }}
                                                        placeholder="Chưa có đề tài..."
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                {/* Members */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="block text-xs text-gray-400 font-medium">
                                                            Thành viên ({groupStudents.length})
                                                        </label>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleOpenForceAdd(group.id)}
                                                            className="h-6 px-2.5 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/50 text-[10px] shadow-none flex items-center gap-1"
                                                        >
                                                            <UserPlus size={10} /> Thêm SV
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {groupStudents.map((member) => (
                                                            <div
                                                                key={member.studentId}
                                                                className="group inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium text-gray-700 shadow-sm"
                                                            >
                                                                <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[9px] font-bold">
                                                                    {member.studentName?.charAt(0)}
                                                                </div>
                                                                {member.studentName}
                                                                {member.role === "LEADER" && (
                                                                    <span className="text-[9px] font-bold text-teal-600 uppercase">★</span>
                                                                )}
                                                                <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {member.role !== "LEADER" && (
                                                                        <button
                                                                            onClick={() => handlePromoteLeader(group.id, member.studentId, member.studentName)}
                                                                            title="Chuyển quyền Leader"
                                                                            className="text-amber-500 hover:text-amber-600 transition-colors p-0.5"
                                                                        >
                                                                            <Star size={10} fill="currentColor" />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleRemoveStudentFromGroup(group.id, member.studentId)}
                                                                        title="Xóa SV khỏi nhóm"
                                                                        className="text-gray-300 hover:text-red-500 transition-colors p-0.5 font-bold"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
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

            {/* Force Add Student Modal */}
            {showForceAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-[24px] shadow-2xl p-6 w-full max-w-md mx-4 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Thêm Thành Viên</h3>
                                <p className="text-xs text-gray-500">Chèn ép sinh viên vào nhóm này</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowForceAddModal(false)} className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100">
                                ×
                            </Button>
                        </div>

                        <div className="overflow-y-auto flex-1 min-h-0 border border-gray-100 rounded-xl divide-y divide-gray-50 mb-5">
                            {students.length === 0 ? (
                                <div className="px-4 py-8 text-center bg-gray-50/50">
                                    <p className="text-sm text-gray-500">Không có sinh viên nào trong lớp.</p>
                                </div>
                            ) : (
                                students.map((student) => {
                                    const isAssigned = assignedStudentIds.has(student.id);
                                    return (
                                        <label
                                            key={student.id}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50/30 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={forceAddSelectedIds.includes(student.id)}
                                                onChange={() => toggleForceAddStudent(student.id)}
                                                className="w-4 h-4 rounded text-teal-600 border-gray-300 focus:ring-teal-400"
                                            />
                                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                {student.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{student.name}</p>
                                                    {isAssigned && <span className="text-[9px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full font-bold">ĐÃ CÓ NHÓM</span>}
                                                </div>
                                                <p className="text-xs text-gray-400">{student.studentCode || student.studentId}</p>
                                            </div>
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        <div className="shrink-0 pt-2 border-t border-gray-50">
                            <Button
                                onClick={handleForceAddSubmit}
                                disabled={forceAddSelectedIds.length === 0}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 font-semibold text-sm shadow-sm border-0 transition-all focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:opacity-50"
                            >
                                Xác nhận thêm
                            </Button>
                        </div>
                    </div>
                </div>
            )}
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
