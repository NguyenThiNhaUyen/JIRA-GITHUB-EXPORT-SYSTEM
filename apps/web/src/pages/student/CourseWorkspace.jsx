import { useState } from "react";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { LINK_STATUS as LINK_STATUS_CFG, SRS_STATUS } from "../../shared/permissions.js";
import {
    BookOpen, CheckCircle, AlertTriangle,
    Clock, Link2,
    Users, BarChart2,
    Crown, MapPin, Github, Star, UserPlus
} from "lucide-react";

import { useGetEnrolledStudents } from "../../features/courses/hooks/useCourses.js";
import { useGetProjects, useAddTeamMember, useGetProjectMetrics, useRemoveTeamMember, useUpdateTeamMember } from "../../features/projects/hooks/useProjects.js";
import { useGenerateSrs } from "../../features/admin/hooks/useReports.js";

const SRS_STATUS_CLS = Object.fromEntries(Object.entries(SRS_STATUS).map(([k, v]) => [k, v.cls]));

export default function CourseWorkspace({ course, group, groupStudents, srsReports, userId, onBack, onSubmitLinks, onDeleteSRS }) {
    const [githubInput, setGithubInput] = useState(group.integration?.githubUrl || "");
    const [jiraInput, setJiraInput] = useState(group.integration?.jiraUrl || "");

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteAvailableStudents, setInviteAvailableStudents] = useState([]);
    const [inviteSelectedIds, setInviteSelectedIds] = useState([]);
    const [isInviting, setIsInviting] = useState(false);

    const myMember = groupStudents.find(m => String(m.studentId) === String(userId));
    const isLeader = myMember?.role?.toUpperCase() === 'LEADER';

    // console.log("[Debug] Workspace Role:", { userId, myMember, isLeader });

    // Links status
    const ghStatus = group.integration?.githubStatus || "NONE";
    const jiraStatus = group.integration?.jiraStatus || "NONE";
    const bothApproved = ghStatus === "APPROVED" && jiraStatus === "APPROVED";

    const { success, error: showError } = useToast();

    const { mutateAsync: addMemberMutateAsync } = useAddTeamMember();
    const { mutateAsync: removeMemberMutateAsync } = useRemoveTeamMember();
    const { mutateAsync: updateMemberMutateAsync } = useUpdateTeamMember();

    const { data: enrolledData = { items: [] }, isFetching: isEnrolledFetching } = useGetEnrolledStudents(course?.id, { pageSize: 500 });
    const { data: allProjectsData = { items: [] } } = useGetProjects({ courseId: course?.id, pageSize: 100 });
    const { data: metrics, isLoading: loadingMetrics } = useGetProjectMetrics(group?.id);

    // Auto-generate SRS Hook
    const { mutate: generateSrsMutate, isPending: isGenerating } = useGenerateSrs();

    // 1-week cooldown logic (using UTC to avoid timezone skews)
    const lastSrs = srsReports?.slice().sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
    const { isWithinWeek, srsCooldownDays } = (() => {
        if (!lastSrs) return { isWithinWeek: false, srsCooldownDays: 0 };
        const now = new Date().getTime();
        const last = new Date(lastSrs.submittedAt).getTime();
        const diffDays = (now - last) / (1000 * 60 * 60 * 24);
        return { 
            isWithinWeek: diffDays < 7, 
            srsCooldownDays: Math.max(1, Math.ceil(7 - diffDays)) 
        };
    })();

    const handleAutoGenerateSRS = () => {
        if (!bothApproved) {
            showError("Bạn cần liên kết GitHub & Jira và được giảng viên duyệt trước khi tạo SRS.");
            return;
        }
        if (isWithinWeek) {
            showError("Theo quy định, bạn chỉ được hệ thống hỗ trợ xuất báo cáo định kỳ 1 lần mỗi tuần.");
            return;
        }
        generateSrsMutate({ projectId: group.id, format: "PDF" }, {
            onSuccess: () => {
                success("Đã ra lệnh cho hệ thống tự động cào dữ liệu tạo SRS! Vui lòng chờ cập nhật (F5).");
            },
            onError: (err) => showError(err?.message || "Không thể tạo báo cáo SRS")
        });
    };

    // Invite students functionality
    const handleOpenInvite = () => {
        // Build a set of studentIds who are already in ANY group of this course
        const studentsWithGroups = new Set();
        (allProjectsData.items || []).forEach(proj => {
            (proj.team || []).forEach(member => {
                studentsWithGroups.add(String(member.studentId || member.userId));
            });
        });

        const available = (enrolledData.items || []).filter(s => !studentsWithGroups.has(String(s.id)));

        setInviteAvailableStudents(available);
        setInviteSelectedIds([]);
        setShowInviteModal(true);
    };

    const toggleInviteStudent = (studentId) => {
        setInviteSelectedIds((prev) =>
            prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
        );
    };

    const handleInviteSubmit = async () => {
        if (inviteSelectedIds.length === 0) return;
        setIsInviting(true);
        
        let successCount = 0;
        let failedCount = 0;

        try {
            // BUG-64: Sequential Inviting (Stress Test Protection)
            // Gửi tuần tự để tránh nghẽn cổ chai DB hoặc Rate Limit từ Backend
            for (const studentId of inviteSelectedIds) {
                try {
                    await addMemberMutateAsync({
                        projectId: group.id,
                        studentId: studentId,
                        role: "MEMBER",
                        responsibility: "Thành viên"
                    });
                    successCount++;
                } catch (e) {
                    failedCount++;
                    console.error(`Failed to invite student ${studentId}:`, e);
                }
            }

            if (successCount > 0) {
                success(`Đã gửi thành công ${successCount} lời mời!`);
            }
            if (failedCount > 0) {
                showError(`${failedCount} sinh viên không thể mời (đã có nhóm hoặc lỗi BE).`);
            }
        } catch (err) {
            showError("Lỗi hệ thống khi gửi lời mời.");
        } finally {
            setIsInviting(false);
            setShowInviteModal(false);
            setInviteSelectedIds([]);
        }
    };

    const handleRemoveMember = async (studentId, studentName) => {
        if (!window.confirm(`Bạn có chắc muốn mời sinh viên ${studentName} ra khỏi nhóm?`)) return;
        try {
            await removeMemberMutateAsync({ projectId: group.id, studentId });
            success(`Đã xóa ${studentName} khỏi nhóm thành công.`);
        } catch (err) {
            showError(err.message || "Không thể xóa thành viên");
        }
    };

    const handlePromoteToLeader = async (studentId, studentName) => {
        if (!window.confirm(`Bạn có chắc muốn chuyển quyền Leader cho ${studentName}? Bạn sẽ trở thành thành viên thường.`)) return;
        try {
            // BUG-67: Sequential Promotion logic - Ensure first action finishes before second starts
            // 1. Promote new leader
            await updateMemberMutateAsync({
                projectId: group.id, studentId, updates: { role: 'LEADER' }
            });
            // 2. Demote myself
            await updateMemberMutateAsync({
                projectId: group.id, studentId: userId, updates: { role: 'MEMBER' }
            });
            success(`Chúc mừng! ${studentName} đã trở thành Leader mới.`);
        } catch (err) {
            showError(err.message || "Không thể chuyển quyền Leader. Hệ thống ghi nhận lỗi logic.");
        }
    };

    return (
        <div className="space-y-5">
            <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold text-teal-700 hover:underline">
                ← Quay lại danh sách lớp
            </button>

            {/* ── Project Header ── */}
            <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-600" />
                <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">{course.subject?.code || course.code}</span>
                                {isLeader ? (
                                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-100">
                                        <Crown size={10} />Team Leader
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200">Team Member</span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                            {group.description && (
                                <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                                    <MapPin size={12} className="text-teal-500 shrink-0" />{group.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${LINK_STATUS_CFG[ghStatus]?.cls || LINK_STATUS_CFG.NONE.cls}`}>
                                <Github size={11} />GitHub: {LINK_STATUS_CFG[ghStatus]?.label || "—"}
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${LINK_STATUS_CFG[jiraStatus]?.cls || LINK_STATUS_CFG.NONE.cls}`}>
                                <Link2 size={11} />Jira: {LINK_STATUS_CFG[jiraStatus]?.label || "—"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* ── Left: Links + Contribution Snapshot ── */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Links panel */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center"><Link2 size={14} className="text-indigo-600" /></div>
                                <CardTitle className="text-base font-semibold text-gray-800">Liên kết dự án</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {isLeader ? (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Github size={10} /> GitHub Repo URL</label>
                                        <input value={githubInput} onChange={e => setGithubInput(e.target.value)}
                                            placeholder="https://github.com/..."
                                            className="mt-1.5 w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Link2 size={10} /> Jira Project URL</label>
                                        <input value={jiraInput} onChange={e => setJiraInput(e.target.value)}
                                            placeholder="https://...atlassian.net/..."
                                            className="mt-1.5 w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                                        />
                                    </div>
                                    {!bothApproved && (
                                        <Button
                                            onClick={() => onSubmitLinks(group, githubInput, jiraInput)}
                                            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 text-sm border-0 shadow-sm mt-1"
                                        >
                                            Gửi để GV phê duyệt
                                        </Button>
                                    )}
                                    {bothApproved && (
                                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                                            <CheckCircle size={15} />Đã được giảng viên duyệt
                                        </div>
                                    )}
                                    {(ghStatus === "REJECTED" || jiraStatus === "REJECTED") && (
                                        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2 border border-red-100">
                                            <AlertTriangle size={15} />Một link bị từ chối — hãy sửa và gửi lại
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Member: view only
                                <div className="space-y-3">
                                    {!isLeader && (
                                        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl">
                                            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                            Chỉ Team Leader mới được submit/chỉnh sửa links.
                                        </div>
                                    )}
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">GitHub</p>
                                        <p className="text-xs text-gray-700 break-all">{group.integration?.githubUrl || "Chưa liên kết"}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Jira</p>
                                        <p className="text-xs text-gray-700 break-all">{group.integration?.jiraUrl || "Chưa liên kết"}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contribution Snapshot */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center"><BarChart2 size={14} className="text-blue-600" /></div>
                                <CardTitle className="text-base font-semibold text-gray-800">Đóng góp của tôi</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-3">
                            {[
                                { label: "My Commits", value: metrics?.contributions?.find(m => String(m.studentUserId) === String(userId))?.commits ?? metrics?.userCommits ?? "0", color: "text-blue-700 bg-blue-50" },
                                { label: "Total Commits", value: metrics?.totalCommits ?? "0", color: "text-teal-700 bg-teal-50" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className={`rounded-xl px-3 py-2.5 flex flex-col items-center text-center ${color}`}>
                                    <span className="text-xl font-bold">{value}</span>
                                    <span className="text-[10px] font-medium mt-0.5 leading-tight">{label}</span>
                                </div>
                            ))}
                            <p className="col-span-2 text-[10px] text-gray-400">
                                {metrics?.lastSyncAt ? `* Cập nhật lần cuối: ${new Date(metrics.lastSyncAt).toLocaleString('vi-VN')}` : "* Đang chờ đồng bộ GitHub API."}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right: Members + SRS ── */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Team Members */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center"><Users size={14} className="text-teal-600" /></div>
                                <CardTitle className="text-base font-semibold text-gray-800">Thành viên nhóm</CardTitle>
                                <span className="ml-auto text-xs font-semibold text-gray-400 mr-2">{groupStudents.length} người</span>
                                {isLeader && (
                                    <button
                                        onClick={handleOpenInvite}
                                        className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                                    >
                                        <UserPlus size={12} /> Mời SV
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {groupStudents.map(stu => {
                                const isMe = stu.studentId === userId;
                                const isLeaderM = stu.role === 'LEADER';
                                return (
                                    <div key={stu.studentId} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isLeaderM ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                                            {stu.studentName?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{stu.studentName}</p>
                                                {isLeaderM && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Star size={8} />Leader</span>}
                                                {isMe && <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full">Bạn</span>}
                                            </div>
                                            <p className="text-xs text-gray-400">{stu.studentCode}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-700">
                                                    {metrics?.contributions?.find(m => String(m.studentUserId) === String(stu.studentId))?.commits ?? "0"}
                                                </p>
                                                <p className="text-[10px] text-gray-400">commits</p>
                                            </div>

                                            {isLeader && !isMe && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handlePromoteToLeader(stu.studentId, stu.studentName)}
                                                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="Chuyển quyền Leader"
                                                    >
                                                        <Crown size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveMember(stu.studentId, stu.studentName)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa khỏi nhóm"
                                                    >
                                                        <Users size={14} className="rotate-45" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* SRS Reports */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center"><BookOpen size={14} className="text-purple-600" /></div>
                                    <div className="flex flex-col">
                                        <CardTitle className="text-base font-semibold text-gray-800 leading-tight">SRS Reports</CardTitle>
                                        {isWithinWeek && isLeader && (
                                            <span className="text-[10px] font-medium text-orange-600">Hồi chiêu: {srsCooldownDays} ngày nữa</span>
                                        )}
                                    </div>
                                </div>
                                {isLeader && (
                                    <button 
                                        onClick={handleAutoGenerateSRS} 
                                        disabled={isGenerating || isWithinWeek}
                                        title={isWithinWeek ? `Cần chờ thêm ${srsCooldownDays} ngày.` : ""}
                                        className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-100 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? "Đang xuất..." : (isWithinWeek ? "Đang hồi chiêu" : "+ Tự động xuất SRS")}
                                    </button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {!isLeader && (
                                <div className="flex items-start gap-2 mx-5 mt-3 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                                    <AlertTriangle size={12} className="shrink-0 mt-0.5 text-amber-500" />
                                    Chỉ Team Leader mới được thao tác quản lý SRS.
                                </div>
                            )}
                            {srsReports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2">
                                    <BookOpen size={24} className="text-gray-300" />
                                    <p className="text-sm text-gray-400">Chưa có SRS nào</p>
                                    {isLeader && (
                                        <button 
                                            onClick={handleAutoGenerateSRS} 
                                            disabled={isGenerating || isWithinWeek}
                                            className="text-xs font-semibold text-teal-700 hover:underline mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? "Hệ thống đang chạy..." : "Xuất bản SRS đầu tiên (Tự động)"}
                                        </button>
                                    )}
                                </div>
                            ) : srsReports.map(rpt => (
                                <div key={rpt.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-mono font-semibold text-gray-700">v{rpt.version}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${SRS_STATUS_CLS[rpt.status] || SRS_STATUS_CLS.DRAFT}`}>{rpt.status}</span>
                                        </div>
                                        {rpt.note && <p className="text-xs text-gray-400 truncate">{rpt.note}</p>}
                                        {rpt.feedback && <p className="text-xs text-blue-600 italic mt-0.5">Nhận xét GV: {rpt.feedback}</p>}
                                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={9} />{new Date(rpt.submittedAt).toLocaleDateString("vi-VN")}</p>
                                    </div>
                                    {isLeader && (
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button onClick={() => onDeleteSRS(rpt.id)} className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-2.5 py-1 rounded-lg transition-colors">Xóa</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Invite Student Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-[24px] shadow-2xl p-6 w-full max-w-md mx-4 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Mời Sinh Viên</h3>
                                <p className="text-xs text-gray-500">Gửi lời mời tham gia nhóm {group.name}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowInviteModal(false)} className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100">
                                ×
                            </Button>
                        </div>

                        <div className="overflow-y-auto flex-1 min-h-0 border border-gray-100 rounded-xl divide-y divide-gray-50 mb-5">
                            {inviteAvailableStudents.length === 0 ? (
                                <div className="px-4 py-8 text-center bg-gray-50/50">
                                    <p className="text-sm text-gray-500">Không có sinh viên nào mới để mời (tất cả đã có nhóm).</p>
                                </div>
                            ) : (
                                inviteAvailableStudents.map((student) => (
                                    <label
                                        key={student.id}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50/30 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={inviteSelectedIds.includes(student.id)}
                                            onChange={() => toggleInviteStudent(student.id)}
                                            className="w-4 h-4 rounded text-teal-600 border-gray-300 focus:ring-teal-400"
                                        />
                                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                                            {student.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{student.name}</p>
                                            <p className="text-xs text-gray-400">{student.studentId}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="shrink-0 pt-2 border-t border-gray-50">
                            <Button
                                onClick={handleInviteSubmit}
                                disabled={inviteSelectedIds.length === 0 || isInviting}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 font-semibold text-sm shadow-sm border-0 transition-all focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {isInviting ? "Đang thêm..." : `Thêm vào nhóm (${inviteSelectedIds.length})`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
