// Manage Groups - Enterprise UI (Real API)
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import {
    ChevronRight, UserPlus, Users,
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
    useUpdateTeamMember,
    useGetProjects
} from "../../features/projects/hooks/useProjects.js";

export default function ManageGroups() {
    const { courseId: paramId } = useParams();
    const courseId = paramId;
    const courseIdNum = courseId ? Number.parseInt(courseId, 10) : null;
    const navigate = useNavigate();
    const { success, error } = useToast();

    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedLeaderId, setSelectedLeaderId] = useState(null);
    const [newGroupTopic, setNewGroupTopic] = useState("");

    const [showForceAddModal, setShowForceAddModal] = useState(false);
    const [forceAddGroupId, setForceAddGroupId] = useState(null);
    const [forceAddSelectedIds, setForceAddSelectedIds] = useState([]);
    const [localGroups, setLocalGroups] = useState([]);

    // Data Fetching
    const { data: course, isLoading: loadingCourse } = useGetCourseById(courseId);
    const { data: studentsData = { items: [] }, isLoading: loadingStudents } = useGetEnrolledStudents(courseId);
    const { data: projectsData, isLoading: loadingProjects, isError: projectsError, refetch: refetchProjects } = useGetProjects({
        courseId: courseIdNum ?? undefined, pageSize: 100, enabled: !!courseId
    });

    // Mutations
    const createProjectMutation = useCreateProject();
    const deleteProjectMutation = useDeleteProject();
    const updateProjectMutation = useUpdateProject();
    const addTeamMemberMutation = useAddTeamMember();
    const removeTeamMemberMutation = useRemoveTeamMember();
    const updateTeamMemberMutation = useUpdateTeamMember();

    const students = Array.isArray(studentsData?.items)
        ? studentsData.items
        : Array.isArray(studentsData?.enrolledStudents)
            ? studentsData.enrolledStudents
            : Array.isArray(studentsData)
                ? studentsData
                : [];

    const apiGroups = (Array.isArray(projectsData?.items) && projectsData.items.length > 0)
        ? projectsData.items
        : (Array.isArray(course?.groups) && course.groups.length > 0 ? course.groups : []);
    const allGroupIds = new Set(apiGroups.map(g => String(g.id)));
    const groups = [...apiGroups, ...localGroups.filter(g => !allGroupIds.has(String(g.id)))];

    useEffect(() => {
        setLocalGroups([]);
    }, [courseId]);

    const computeNextGroupNumber = () => {
        const safeGroups = Array.isArray(groups) ? groups : [];
        if (safeGroups.length === 0) return 1;
        const max = Math.max(
            ...safeGroups.map((g) => {
                const match = g?.name?.match?.(/Nhóm\s+(\d+)/i);
                return match ? Number.parseInt(match[1], 10) : 0;
            })
        );
        return (Number.isFinite(max) ? max : 0) + 1;
    };

    const buildGroupName = ({ groupNumber, attempt = 0 }) => {
        const base = `Nhóm ${groupNumber}`;
        if (attempt <= 0) return `${base} - ${Date.now().toString().slice(-4)}`;
        return `${base} - ${Date.now().toString().slice(-4)}-${attempt}`;
    };

    const handleCreateGroup = async () => {
        if (selectedStudents.length === 0) { error("Vui lòng chọn ít nhất 1 học sinh"); return; }
        if (!newGroupTopic.trim()) { error("Vui lòng nhập đề tài cho nhóm"); return; }

        try {
            const groupNumber = computeNextGroupNumber();

            let project = null;
            for (let attempt = 0; attempt < 3; attempt++) {
                const name = buildGroupName({ groupNumber, attempt });
                try {
                    project = await createProjectMutation.mutateAsync({
                        courseId: Number.isFinite(courseIdNum) ? courseIdNum : parseInt(courseId),
                        name,
                        description: newGroupTopic,
                        startDate: new Date().toISOString(),
                        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // Default 3 months
                    });
                    break;
                } catch (err) {
                    const msg = err?.message || "Lỗi hệ thống";
                    const isDuplicate = msg.includes("already exists") || msg.includes("đã tồn tại");
                    if (isDuplicate && attempt < 2) {
                        error("Tên nhóm đã tồn tại, đang thử lại với tên mới...");
                        continue;
                    }
                    throw err;
                }
            }
            if (!project) throw new Error("Không thể tạo nhóm (retry exhausted)");

            // Add selected members
            for (const studentId of selectedStudents) {
                await addTeamMemberMutation.mutateAsync({
                    projectId: project?.id,
                    studentId,
                    role: studentId === selectedLeaderId ? "LEADER" : "MEMBER"
                });
            }

            success(`Đã tạo nhóm "${project?.name ?? `Nhóm (ID: ${project?.id ?? "N/A"})`}"`);
            setSelectedStudents([]);
            setSelectedLeaderId(null);
            setNewGroupTopic("");
            setLocalGroups(prev => [...prev, {
                id: project?.id, name: project?.name, description: newGroupTopic,
                team: selectedStudents.map(sid => ({ studentId: sid, role: sid === selectedLeaderId ? "LEADER" : "MEMBER" })),
                integration: null
            }]);
            setTimeout(() => refetchProjects(), 1500);
        } catch (err) {
            const msg = err?.message || "Lỗi hệ thống";
            if (msg.includes("already exists") || msg.includes("đã tồn tại")) {
                error("Tên nhóm đã tồn tại, vui lòng thử lại.");
            } else {
                error("Không thể tạo nhóm: " + msg);
            }
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
        const currentGroup = groups.find((g) => String(g?.id) === String(groupId));
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
    const assignedStudentIds = new Set(
        groups.flatMap(g => (Array.isArray(g?.team) ? g.team : [])
            .map(m => String(m?.studentId ?? m?.id ?? m?.studentUserId)))
    );
    const availableStudents = students; // show all, disable assigned ones in UI

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

    if (loadingCourse || loadingStudents || loadingProjects) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
                <p className="text-gray-500 font-medium">Đang tải dữ liệu nhóm...</p>
            </div>
        );
    }


    const showApiError = projectsError && !loadingProjects && localGroups.length === 0;

    return (
        <div className="space-y-6">
            {showApiError && (
                <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-sm">
                    <span className="text-amber-700">⚠ Không thể tải danh sách nhóm từ server.</span>
                    <button onClick={() => refetchProjects()} className="text-xs font-semibold text-teal-700 hover:underline ml-4">Thử lại</button>
                </div>
            )}

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
                <MiniStat label="Tổng học sinh" value={students?.length ?? 0} color="text-blue-600 bg-blue-50" />
                <MiniStat label="Chưa phân nhóm" value={availableStudents?.length ?? 0} color="text-orange-600 bg-orange-50" />
                <MiniStat label="Nhóm hiện có" value={groups?.length ?? 0} color="text-teal-600 bg-teal-50" />
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
                                        {availableStudents?.length ?? 0} có sẵn
                                    </span>
                                </div>
                                <div className="border border-gray-100 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                                    {(availableStudents?.length ?? 0) === 0 ? (
                                        <div className="px-4 py-6 text-center">
                                            <p className="text-xs text-gray-400">Tất cả học sinh đã được phân nhóm</p>
                                        </div>
                                    ) : (
                                            availableStudents
                                                .slice()
                                                .sort((a, b) => {
                                                    const aId = a?.id ?? a?.studentId;
                                                    const bId = b?.id ?? b?.studentId;
                                                    const aAssigned = assignedStudentIds.has(String(aId));
                                                    const bAssigned = assignedStudentIds.has(String(bId));
                                                    // false (chưa có nhóm) -> lên trên; true (đã có nhóm) -> xuống dưới
                                                    return Number(aAssigned) - Number(bAssigned);
                                                })
                                                .map((student) => {
                                            const studentUniqueId = student?.id ?? student?.studentId;
                                            const displayName = student?.name ?? student?.fullName ?? `SV (ID: ${student?.id ?? student?.studentId ?? "N/A"})`;
                                            const isAlreadyAssigned = assignedStudentIds.has(String(studentUniqueId));
                                            return (
                                                <label
                                                    key={studentUniqueId}
                                                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors border-b border-gray-50 last:border-0 ${isAlreadyAssigned ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.includes(studentUniqueId)}
                                                        disabled={isAlreadyAssigned}
                                                        onChange={() => !isAlreadyAssigned && toggleStudentSelection(studentUniqueId)}
                                                        className="w-4 h-4 rounded text-teal-600 border-gray-300 focus:ring-teal-400"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-700">{displayName}</p>
                                                        {isAlreadyAssigned && <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">Đã có nhóm</span>}
                                                        <p className="text-xs text-gray-400">{student?.studentId ?? student?.id ?? "N/A"}</p>
                                                    </div>

                                                    {selectedStudents.includes(studentUniqueId) && (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedLeaderId(studentUniqueId); }}
                                                            className={`p-1.5 rounded-lg transition-all ${selectedLeaderId === studentUniqueId ? 'bg-amber-100 text-amber-600' : 'text-gray-300 hover:text-amber-400'}`}
                                                            title="Chọn làm Trưởng nhóm"
                                                        >
                                                            <Star size={14} fill={selectedLeaderId === studentUniqueId ? "currentColor" : "none"} />
                                                        </button>
                                                    )}
                                                </label>
                                            )
                                        })
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
                                    {groups?.length ?? 0} nhóm
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(groups?.length ?? 0) === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                                        <Users size={20} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-400">Chưa có nhóm nào</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {groups.map((group) => {
                                        const groupStudents = Array.isArray(group?.team) ? group.team : [];
                                        const groupTopic = group?.topic ?? group?.description ?? "";
                                        const memberCount = groupStudents?.length ?? group?.teamSize ?? 0;
                                        return (
                                            <div key={group.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                                                {/* Group header row */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-gray-900">{group?.name ?? `Nhóm (ID: ${group?.id ?? "N/A"})`}</h3>
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
                                                        key={`${group.id}-topic-${groupTopic}`}
                                                        defaultValue={groupTopic}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== groupTopic)
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
                                                            Thành viên ({memberCount})
                                                        </label>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleOpenForceAdd(group.id)}
                                                            className="h-6 px-2.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white border border-teal-200/50 text-[10px] shadow-none flex items-center gap-1"
                                                        >
                                                            <UserPlus size={10} /> Thêm SV
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {groupStudents.map((member, idx) => {
                                                            const displayName = member?.studentName ?? member?.name ?? member?.fullName ?? `SV (ID: ${member?.studentId ?? member?.id ?? "N/A"})`;
                                                            return (
                                                                <div
                                                                    key={member?.studentId ?? member?.id ?? idx}
                                                                    className="group inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium text-gray-700 shadow-sm"
                                                                >
                                                                    <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[9px] font-bold">
                                                                        {displayName?.charAt?.(0) ?? "S"}
                                                                    </div>
                                                                    {displayName}
                                                                    {member?.role === "LEADER" && (
                                                                        <span className="text-[9px] font-bold text-teal-600 uppercase">★</span>
                                                                    )}
                                                                    <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        {member?.role !== "LEADER" && (
                                                                            <button
                                                                                onClick={() => handlePromoteLeader(group?.id, member?.studentId ?? member?.id, displayName)}
                                                                                title="Chuyển quyền Leader"
                                                                                className="text-amber-500 hover:text-amber-600 transition-colors p-0.5"
                                                                            >
                                                                                <Star size={10} fill="currentColor" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => handleRemoveStudentFromGroup(group?.id, member?.studentId ?? member?.id)}
                                                                            title="Xóa SV khỏi nhóm"
                                                                            className="text-gray-300 hover:text-red-500 transition-colors p-0.5 font-bold"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
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
                            {(students?.length ?? 0) === 0 ? (
                                <div className="px-4 py-8 text-center bg-gray-50/50">
                                    <p className="text-sm text-gray-500">Không có sinh viên nào trong lớp.</p>
                                </div>
                            ) : (
                                students
                                    .slice()
                                    .sort((a, b) => {
                                        const aId = a?.id ?? a?.studentId;
                                        const bId = b?.id ?? b?.studentId;
                                        const aAssigned = assignedStudentIds.has(String(aId));
                                        const bAssigned = assignedStudentIds.has(String(bId));
                                        return Number(aAssigned) - Number(bAssigned);
                                    })
                                    .map((student) => {
                                        const isAssigned = assignedStudentIds.has(String(student?.id ?? student?.studentId));
                                        const displayName = student?.name ?? student?.fullName ?? `SV (ID: ${student?.id ?? student?.studentId ?? "N/A"})`;
                                        return (
                                            <label
                                                key={student?.id ?? student?.studentId}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50/30 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={forceAddSelectedIds.includes(student?.id)}
                                                    onChange={() => toggleForceAddStudent(student?.id)}
                                                    className="w-4 h-4 rounded text-teal-600 border-gray-300 focus:ring-teal-400"
                                                />
                                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {displayName?.charAt?.(0) ?? "S"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
                                                        {isAssigned && <span className="text-[9px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full font-bold">ĐÃ CÓ NHÓM</span>}
                                                    </div>
                                                    <p className="text-xs text-gray-400">{student?.studentCode ?? student?.studentId ?? student?.id ?? "N/A"}</p>
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
