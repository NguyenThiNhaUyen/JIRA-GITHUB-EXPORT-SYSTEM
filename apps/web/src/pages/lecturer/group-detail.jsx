// Group Detail - Rebuilt with Feature-Based & React Query
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import {
    useGetProjectById,
    useApproveIntegration,
    useRejectIntegration,
    useUpdateTeamMember
} from "../../features/projects/hooks/useProjects.js";
import { useGenerateSrs } from "../../features/admin/hooks/useReports.js";
import { useGetProjectSrs, useUpdateSrsStatus, useProvideSrsFeedback, useDeleteSrs } from "../../features/srs/hooks/useSrs.js";
import { SRS_STATUS } from "../../shared/permissions.js";

import {
    ChevronRight, ArrowLeft, GitBranch, BookOpen,
    Users, Calendar, CheckCircle, Clock, ExternalLink,
    FileDown, AlertTriangle, Shield
} from "lucide-react";

export default function GroupDetail() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error } = useToast();

    // 1. Dữ liệu thực từ useGetProjectById (Project thực chất là Group)
    const { data: group, isLoading, isError } = useGetProjectById(groupId);
    const students = group?.team || [];

    // 2. Khai báo các Mutation thay đổi trạng thái
    const approveMutation = useApproveIntegration();
    const rejectMutation = useRejectIntegration();
    const updateMemberMutation = useUpdateTeamMember();
    
    const { mutate: generateSrsMutate, isPending: isGeneratingSrs } = useGenerateSrs();
    
    // 3. SRS Reports
    const { data: srsReports = [], isLoading: srsLoading } = useGetProjectSrs(groupId);
    const updateSrsStatusMutation = useUpdateSrsStatus();
    const provideFeedbackMutation = useProvideSrsFeedback();
    const deleteSrsMutation = useDeleteSrs();

    // Không còn useEffect lằng nhằng nữa, UI chỉ tập trung Render Data
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                    <p className="text-sm text-gray-400">Đang tải dữ liệu từ API...</p>
                </div>
            </div>
        );
    }

    if (isError || !group) {
        return (
            <div className="flex h-full items-center justify-center flex-col gap-4">
                <p className="text-red-500 font-semibold">Cảnh báo: Không thể tải dữ liệu nhóm</p>
                <Button onClick={() => navigate(-1)} variant="outline">Trở về</Button>
            </div>
        );
    }
    const course = group.course;

    // Functions thao tác gọi thẳng mutation
    const handleApproveLink = () => {
        approveMutation.mutate(groupId, {
            onSuccess: () => success(`Đã duyệt tích hợp cho nhóm`)
        });
    };

    const handleRejectLink = () => {
        const reason = prompt("Nhập lý do từ chối:");
        if (reason === null) return;
        rejectMutation.mutate(
            { projectId: groupId, reason },
            {
                onSuccess: () => success(`Đã từ chối tích hợp cho nhóm`)
            }
        );
    };

    const handleUpdateScore = (studentId, score) => {
        const numScore = parseInt(score, 10);
        if (isNaN(numScore) || numScore < 0 || numScore > 100) {
            error("Điểm phải từ 0 đến 100");
            return;
        }

        updateMemberMutation.mutate(
            { projectId: groupId, studentId, updates: { contributionScore: numScore } },
            {
                onSuccess: () => success(`Đã lưu điểm ${numScore} cho sinh viên`)
            }
        );
    };

    const handleGenerateSrs = () => {
        generateSrsMutate({ projectId: groupId, format: "PDF" }, {
            onSuccess: () => success("Hệ thống đang tự tạo và xuất báo cáo SRS!"),
            onError: (err) => error("Lỗi xuất SRS: " + (err.message || ""))
        });
    };

    const handleUpdateSrsStatus = (reportId, newStatus) => {
        updateSrsStatusMutation.mutate({ reportId, newStatus }, {
            onSuccess: () => success(`Đã cập nhật trạng thái SRS thành ${newStatus}`)
        });
    };

    const handleProvideSrsFeedback = (reportId) => {
        const feedback = prompt("Nhập nhận xét cho bản SRS này:");
        if (feedback === null) return;
        provideFeedbackMutation.mutate({ reportId, feedback }, {
            onSuccess: () => success("Đã lưu nhận xét cho SRS")
        });
    };

    const handleDeleteSrs = (reportId) => {
        if (!confirm("Bạn có chắc muốn xóa bản SRS này?")) return;
        deleteSrsMutation.mutate({ reportId }, {
            onSuccess: () => success("Đã xóa bản SRS")
        });
    };

    const handleExport = () => {
        try {
            // 1. Prepare CSV headers
            const headers = ["MSSV", "Họ Tên", "Vai Trò", "Điểm Đóng Góp"];

            // 2. Prepare CSV rows from students data
            const rows = students.map(student => {
                return [
                    student.studentCode,
                    student.studentName,
                    student.role,
                    student.contributionScore || 0
                ].map(val => `"${val}"`).join(",");
            });

            // 3. Combine headers and rows
            const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");

            // 4. Create Blob and trigger download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `DanhSachNhom_${group.name}_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            success("Đã xuất danh sách thành viên thành công!");
        } catch (err) {
            error("Lỗi khi xuất file");
        }
    };

    const githubApproved = group.integration?.githubStatus === "APPROVED";
    const jiraApproved = group.integration?.jiraStatus === "APPROVED";
    const fullyApproved = githubApproved && jiraApproved;


    return (
        <div className="space-y-6">

            {/* ── Breadcrumb + Page Header ─────────────── */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 min-w-0">
                    <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <button
                            onClick={() => navigate(-2)}
                            className="text-teal-700 font-semibold hover:underline"
                        >Giảng viên</button>
                        <ChevronRight size={12} />
                        <button
                            onClick={() => navigate(`/lecturer/course/${group.courseId}/manage-groups`)}
                            className="text-gray-600 hover:underline"
                        >Quản lý Nhóm</button>
                        <ChevronRight size={12} />
                        <span className="text-gray-800 font-semibold truncate">{group.name}</span>
                    </nav>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-800">{group.name}</h2>
                        {fullyApproved ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                                <CheckCircle size={12} /> Hoàn thành
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
                                <Clock size={12} /> Chờ duyệt
                            </span>
                        )}
                    </div>
                    {course && (
                        <p className="text-sm text-gray-400">{course.code} — {course.name}</p>
                    )}
                </div>
                <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="flex items-center gap-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl h-9 px-4 text-sm shrink-0"
                >
                    <ArrowLeft size={14} />
                    Quay lại
                </Button>
            </div>

            {/* ── Quick Status Bar ─────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickStat
                    icon={<Users size={15} />}
                    label="Thành viên"
                    value={students.length}
                    color="text-blue-600 bg-blue-50 border-blue-100"
                />
                <QuickStat
                    icon={<GitBranch size={15} />}
                    label="GitHub"
                    value={githubApproved ? "Đã duyệt" : "Chờ duyệt"}
                    color={githubApproved ? "text-green-700 bg-green-50 border-green-100" : "text-gray-500 bg-gray-50 border-gray-100"}
                />
                <QuickStat
                    icon={<BookOpen size={15} />}
                    label="Jira"
                    value={jiraApproved ? "Đã duyệt" : "Chờ duyệt"}
                    color={jiraApproved ? "text-green-700 bg-green-50 border-green-100" : "text-gray-500 bg-gray-50 border-gray-100"}
                />
                <QuickStat
                    icon={<Calendar size={15} />}
                    label="Ngày tạo"
                    value={group.createdAt ? new Date(group.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                    color="text-gray-600 bg-gray-50 border-gray-100"
                />
            </div>

            {/* ── Main Content Grid ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Left: Group Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Group info card */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <CardTitle className="text-base font-semibold text-gray-800">Thông tin Nhóm</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-5">
                            <InfoRow label="Tên nhóm" value={<span className="font-semibold text-gray-900">{group.name}</span>} />
                            <InfoRow
                                label="Đề tài"
                                value={
                                    group.description
                                        ? <span className="text-gray-800">{group.description}</span>
                                        : <span className="text-gray-400 italic text-sm">Chưa có đề tài</span>
                                }
                            />
                        </CardContent>
                    </Card>

                    {/* Members card */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold text-gray-800">Thành viên</CardTitle>
                                <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-2.5 py-1 font-medium border border-gray-100">
                                    {students.length} người
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3 p-4">
                            {students.map((student) => (
                                <div key={student.studentId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-teal-100 border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold text-teal-700 shrink-0">
                                        {student.studentName?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{student.studentName}</p>
                                            {student.role === "LEADER" && (
                                                <span className="text-[9px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    Leader
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">{student.studentCode}</p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Điểm</label>
                                        <input
                                            type="number"
                                            min="0" max="100"
                                            placeholder="--"
                                            defaultValue={student.contributionScore}
                                            onBlur={(e) => {
                                                if (e.target.value !== "" && e.target.value !== String(student.contributionScore))
                                                    handleUpdateScore(student.studentId, e.target.value);
                                            }}
                                            className="w-14 px-2 py-1.5 text-sm text-center font-bold text-teal-700 bg-teal-50/50 border border-teal-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Links + Export + Warning */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Link Approval */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <Shield size={15} className="text-indigo-600" />
                                </div>
                                <CardTitle className="text-base font-semibold text-gray-800">Liên kết Dự án</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-5">

                            {/* GitHub */}
                            <LinkApprovalSection
                                icon={<GitBranch size={15} className="text-gray-700" />}
                                label="GitHub Repository"
                                url={group.integration?.githubUrl}
                                status={group.integration?.githubStatus}
                                onApprove={() => handleApproveLink()}
                                onReject={() => handleRejectLink()}
                            />

                            <div className="border-t border-gray-50" />

                            {/* Jira */}
                            <LinkApprovalSection
                                icon={<BookOpen size={15} className="text-gray-700" />}
                                label="Jira Project"
                                url={group.integration?.jiraUrl}
                                status={group.integration?.jiraStatus}
                                onApprove={() => handleApproveLink()}
                                onReject={() => handleRejectLink()}
                            />
                        </CardContent>
                    </Card>


                    {/* SRS Reports History */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                                        <BookOpen size={15} className="text-teal-600" />
                                    </div>
                                    <CardTitle className="text-base font-semibold text-gray-800">Lịch sử Báo cáo SRS</CardTitle>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100 uppercase tracking-widest">
                                    ISO 29148
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 p-4">
                            {srsLoading ? (
                                <div className="py-8 text-center text-gray-400 text-sm">Đang tải danh sách báo cáo...</div>
                            ) : srsReports.length === 0 ? (
                                <div className="py-8 text-center text-gray-400 text-sm italic">Nhóm chưa có bản lưu SRS nào</div>
                            ) : (
                                <div className="space-y-3">
                                    {srsReports.map((rp) => (
                                        <div key={rp.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-teal-100 hover:bg-teal-50/10 transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-white shadow-sm transition-colors">
                                                <FileDown size={18} className="text-gray-400 group-hover:text-teal-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-gray-800 truncate">
                                                        Bản {rp.id}
                                                    </span>
                                                    <Badge className={SRS_STATUS[rp.status]?.cls || ""}>
                                                        {SRS_STATUS[rp.status]?.label || rp.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(rp.submittedAt).toLocaleDateString()}</span>
                                                    {rp.feedback && <span className="text-teal-600 bg-teal-50 px-1.5 rounded truncate max-w-[150px]">Phản hồi: {rp.feedback}</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg text-teal-600 hover:bg-teal-50" title="Tải về" asChild>
                                                    <a href={rp.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:bg-gray-100" title="Nhận xét" onClick={() => handleProvideSrsFeedback(rp.id)}>
                                                    <BookOpen size={14} />
                                                </Button>
                                                <div className="w-px h-4 bg-gray-100 mx-1" />
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg text-red-400 hover:bg-red-50" title="Xóa" onClick={() => handleDeleteSrs(rp.id)}>
                                                    <AlertTriangle size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>


                    {/* Export */}
                    <Card className="border border-gray-100 shadow-sm rounded-[24px] overflow-hidden bg-white">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">Xuất báo cáo SRS (ISO 29148)</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Tự động xuất SRS từ dữ liệu Jira & Github (Không giới hạn số lần)</p>
                                </div>
                                <Button
                                    onClick={handleGenerateSrs}
                                    disabled={isGeneratingSrs}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 px-4 text-sm disabled:opacity-50 border-0 shadow-sm"
                                >
                                    <FileDown size={14} />
                                    {isGeneratingSrs ? "Đang xuất..." : "Xuất SRS ISO"}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">Xuất bảng điểm (CSV)</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Tải về danh sách thành viên và điểm</p>
                                </div>
                                <Button
                                    onClick={handleExport}
                                    variant="outline"
                                    className="flex items-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-9 px-4 text-sm"
                                >
                                    <FileDown size={14} />
                                    Tải CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Warning section */}
                    <Card className="border border-orange-100 shadow-sm rounded-[24px] overflow-hidden bg-orange-50">
                        <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                                    <AlertTriangle size={18} className="text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 mb-1">Gửi cảnh báo nhóm</p>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Gửi email cảnh báo đến các thành viên có ít hoạt động commit hoặc task Jira.
                                    </p>
                                    <Button
                                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white border-0 rounded-xl h-9 px-4 text-sm shadow-sm"
                                        onClick={() => success("Đã gửi cảnh báo đến nhóm (chức năng demo)")}
                                    >
                                        <AlertTriangle size={13} />
                                        Gửi cảnh báo
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function QuickStat({ icon, label, value, color }) {
    return (
        <div className={`rounded-2xl px-4 py-3 border flex items-center gap-3 ${color}`}>
            <div className="shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
                <p className="text-sm font-bold truncate">{value}</p>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
            <div className="text-sm">{value}</div>
        </div>
    );
}

function LinkApprovalSection({ icon, label, url, status, approvedAt, onApprove, onReject }) {
    const isApproved = status === "APPROVED";
    const isRejected = status === "REJECTED";
    const isPending = status === "PENDING";

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${isApproved ? "bg-green-50 text-green-700 border border-green-100" : isRejected ? "bg-red-50 text-red-700 border border-red-100" : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}>
                    {isApproved ? <><CheckCircle size={10} /> Đã duyệt</> : isRejected ? <><Shield size={10} /> Đã từ chối</> : <><Clock size={10} /> Chờ duyệt</>}
                </span>
            </div>

            <div className="flex gap-2">
                <div className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border ${url
                    ? isApproved
                        ? "bg-white border-green-200 text-gray-800"
                        : isRejected
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-gray-50 border-gray-100 text-gray-600"
                    : "bg-gray-50 border-gray-100 text-gray-300 italic"
                    }`}>
                    {url ? (
                        <>
                            <span className="truncate flex-1">{url}</span>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`shrink-0 ${isRejected ? 'text-red-500 hover:text-red-700' : 'text-blue-500 hover:text-blue-700'}`}
                            >
                                <ExternalLink size={13} />
                            </a>
                        </>
                    ) : (
                        <span>Chưa có link</span>
                    )}
                </div>
                {url && (isPending || isRejected) && (
                    <Button
                        size="sm"
                        onClick={onApprove}
                        className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white rounded-xl border-0 px-4 shadow-sm transition-all focus:ring-2 focus:ring-teal-400 focus:ring-offset-1"
                    >
                        Duyệt
                    </Button>
                )}
                {url && (isPending || isApproved) && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onReject}
                        className="shrink-0 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-xl px-4 shadow-sm transition-all"
                    >
                        Từ chối
                    </Button>
                )}
            </div>

            {isApproved && approvedAt && (
                <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                    <CheckCircle size={10} />
                    Đã duyệt lúc {new Date(approvedAt).toLocaleString("vi-VN")}
                </p>
            )}
        </div>
    );
}
