// Group Detail - Rebuilt with Feature-Based & React Query
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import {
    useGetProjectById,
    useApproveIntegration,
    useRejectIntegration,
    useUpdateTeamMember
} from "../../features/projects/hooks/useProjects.js";
import { useGenerateSrsReport } from "../../features/projects/hooks/useReports.js";
import { getDownloadUrl } from "../../features/projects/api/reportApi.js";
import { useSendAlert } from "../../features/system/hooks/useAlerts.js";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatsCard } from "../../components/shared/StatsCard.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";

import {
    ChevronRight, ArrowLeft, GitBranch, BookOpen,
    Users, Calendar, CheckCircle, Clock, ExternalLink,
    FileDown, AlertTriangle, Shield, Activity
} from "lucide-react";

export default function GroupDetail() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    // 1. Dữ liệu thực từ useGetProjectById (Project thực chất là Group)
    const { data: group, isLoading, isError } = useGetProjectById(groupId);
    const students = group?.team || [];

    // 2. Khai báo các Mutation thay đổi trạng thái
    const approveMutation = useApproveIntegration();
    const rejectMutation = useRejectIntegration();
    const updateMemberMutation = useUpdateTeamMember();
    const generateSrsMutation = useGenerateSrsReport();
    const { mutate: sendAlert, isPending: isSendingAlert } = useSendAlert();

    if (isLoading) {
        return (
            <div className="flex flex-col h-64 items-center justify-center gap-4">
                <Activity className="animate-spin text-teal-600 h-10 w-10" /> 
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Đang tải dữ liệu từ API...</span>
            </div>
        );
    }

    if (isError || !group) {
        return (
            <div className="flex flex-col h-64 items-center justify-center gap-4">
                <p className="text-red-500 font-black uppercase tracking-widest text-xs">Cảnh báo: Không thể tải dữ liệu nhóm</p>
                <Button onClick={() => navigate("/lecturer/my-courses")} variant="outline" className="rounded-2xl border-gray-100 uppercase text-[10px] font-black h-11 px-6 tracking-widest">Trở về bảng tin</Button>
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
            showError("Điểm phải từ 0 đến 100");
            return;
        }

        updateMemberMutation.mutate(
            { projectId: groupId, studentId, updates: { contributionScore: numScore } },
            {
                onSuccess: () => success(`Đã lưu điểm ${numScore} cho sinh viên`)
            }
        );
    };

    const handleExport = () => {
        try {
            const headers = ["MSSV", "Họ Tên", "Vai Trò", "Điểm Đóng Góp"];
            const rows = students.map(student => {
                return [
                    student.studentCode,
                    student.studentName,
                    student.role,
                    student.contributionScore || 0
                ].map(val => `"${val}"`).join(",");
            });

            const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
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
            showError("Lỗi khi xuất file");
        }
    };

    const handleExportSrs = async () => {
        try {
            success("Đang tổng hợp dữ liệu từ Jira & GitHub...");
            
            // 1. Trigger the backend API to generate SRS
            const res = await generateSrsMutation.mutateAsync({ projectId: groupId, format: "PDF" });
            const reportId = res?.reportId || res?.data?.reportId;
            
            if (!reportId) {
                error("Không nhận được mã báo cáo từ server.");
                return;
            }

            // 2. Poll the download URL (in a real app, you can use the polling hook, but here we manually retry)
            success("Đang tạo PDF, vui lòng chờ trong giây lát...");
            
            let downloadUrl = null;
            let attempts = 0;
            
            while (!downloadUrl && attempts < 15) { // Try for ~30 seconds
                await new Promise(r => setTimeout(r, 2000));
                attempts++;
                
                try {
                    const urlRes = await getDownloadUrl(reportId);
                    if (urlRes?.downloadUrl || urlRes?.data?.downloadUrl) {
                        downloadUrl = urlRes.downloadUrl || urlRes.data.downloadUrl;
                    }
                } catch (e) {
                    // API might return 404 while generating, ignore and continue polling
                }
            }

            if (downloadUrl) {
                // 3. Trigger Download
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.setAttribute("download", `SRS_Report_Group_${group.name}.pdf`);
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                success("Đã tải xuống báo cáo SRS thành công!");
            } else {
                error("Quá trình tạo file đang bị chậm, vui lòng thử lại sau.");
            }
        } catch (err) {
            error(err?.message || "Lỗi khi xuất báo cáo SRS");
        }
    };

    const githubApproved = group.integration?.githubStatus === "APPROVED";
    const jiraApproved = group.integration?.jiraStatus === "APPROVED";

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title={group.name}
                subtitle={`${course?.code || ''} — ${course?.name || ''}. Quản lý trạng thái và thành viên của nhóm dự án.`}
                breadcrumb={["Giảng viên", "Nhóm", group.name]}
                actions={[
                    <Button 
                        key="back"
                        variant="outline" 
                        onClick={() => navigate(-1)}
                        className="rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-gray-100 hover:bg-gray-50 shadow-sm"
                    >
                        <ArrowLeft size={14} className="mr-2"/> Quay lại
                    </Button>
                ]}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard label="Thành viên" value={students.length} icon={Users} variant="info" />
                <StatsCard label="GitHub" value={githubApproved ? "Ổn định" : "Chờ duyệt"} icon={GitBranch} variant={githubApproved ? "success" : "warning"} />
                <StatsCard label="Jira" value={jiraApproved ? "Ổn định" : "Chờ duyệt"} icon={BookOpen} variant={jiraApproved ? "success" : "warning"} />
                <StatsCard label="Ngày tạo" value={group.createdAt ? new Date(group.createdAt).toLocaleDateString("vi-VN") : "N/A"} icon={Calendar} variant="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Info & Members */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 py-5 px-8">
                            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Thông tin Nhóm</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <InfoRow label="Tên định danh" value={<span className="font-black text-gray-800 uppercase tracking-tight text-base">{group.name}</span>} />
                            <InfoRow
                                label="Đề tài đăng ký"
                                value={
                                    group.description
                                        ? <span className="text-sm font-bold text-gray-600 leading-relaxed block">{group.description}</span>
                                        : <span className="text-[10px] font-black text-gray-300 uppercase italic">Chưa xác định đề tài</span>
                                }
                            />
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 py-5 px-8 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Thành viên</CardTitle>
                            <span className="text-[10px] font-black text-teal-600 bg-teal-50 rounded-full px-3 py-1 border border-teal-100 uppercase tracking-widest">
                                {students.length} Student
                            </span>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            {students.map((student) => (
                                <div key={student.studentId} className="flex items-center gap-4 p-4 rounded-[24px] hover:bg-gray-50/50 transition-all border border-transparent hover:border-gray-50">
                                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-black text-teal-700 shadow-sm shrink-0">
                                        {student.studentName?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-black text-gray-800 uppercase tracking-tight truncate">{student.studentName}</p>
                                            {student.role === "LEADER" && (
                                                <StatusBadge status="info" label="Leader" variant="info" />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.studentCode}</p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-3">
                                        <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Score</label>
                                        <input
                                            type="number"
                                            min="0" max="100"
                                            defaultValue={student.contributionScore}
                                            onBlur={(e) => handleUpdateScore(student.studentId, e.target.value)}
                                            className="w-16 h-10 px-0 text-center font-black text-teal-600 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Links & Controls */}
                <div className="lg:col-span-3 space-y-8">
                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-50 py-5 px-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm"><Shield size={20} /></div>
                                <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Tích hợp Kỹ thuật</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <LinkApprovalSection
                                icon={<GitBranch size={16} className="text-gray-400" />}
                                label="Repository GitHub"
                                url={group.integration?.githubUrl}
                                status={group.integration?.githubStatus}
                                onApprove={handleApproveLink}
                                onReject={handleRejectLink}
                            />

                            <div className="h-px bg-gray-50" />

                            <LinkApprovalSection
                                icon={<BookOpen size={16} className="text-gray-400" />}
                                label="Dự án Jira Software"
                                url={group.integration?.jiraUrl}
                                status={group.integration?.jiraStatus}
                                onApprove={handleApproveLink}
                                onReject={handleRejectLink}
                            />
                        </CardContent>
                    </Card>

                    {/* Export */}
                    <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white hover:shadow-lg transition-all">
                        <CardHeader className="border-b border-gray-50 py-5 px-8 flex flex-row items-center justify-between">
                             <CardTitle className="text-base font-black text-gray-800 uppercase tracking-widest">Báo cáo & Xuất bản</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            <div className="flex items-center justify-between gap-6">
                                <div>
                                    <h4 className="font-black text-gray-800 text-[10px] uppercase tracking-widest mb-1.5">Xuất báo cáo SRS</h4>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-80">Xuất dữ liệu Jira/GitHub sang PDF chuẩn ISO 29148.</p>
                                </div>
                                <Button
                                    onClick={handleExportSrs}
                                    disabled={generateSrsMutation.isPending}
                                    variant="outline"
                                    className="rounded-2xl h-12 px-8 text-[10px] font-black uppercase tracking-widest border-teal-100 text-teal-600 hover:bg-teal-50 shadow-sm shrink-0"
                                >
                                    <FileDown size={16} className="mr-2" /> {generateSrsMutation.isPending ? "Đang tạo..." : "Xuất SRS"}
                                </Button>
                            </div>

                            <div className="h-px bg-gray-50" />

                            <div className="flex items-center justify-between gap-6">
                                <div>
                                    <h4 className="font-black text-gray-800 text-[10px] uppercase tracking-widest mb-1.5">Danh sách Thành viên</h4>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-80">Xuất bảng điểm đóng góp của nhóm sang định dạng CSV.</p>
                                </div>
                                <Button
                                    onClick={handleExport}
                                    variant="outline"
                                    className="rounded-2xl h-10 px-6 text-[10px] font-black uppercase tracking-widest border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm shrink-0"
                                >
                                    <Users size={14} className="mr-2" /> Xuất CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-orange-100 shadow-sm rounded-[32px] overflow-hidden bg-orange-50/20">
                        <CardContent className="p-8">
                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 rounded-[24px] bg-orange-100 flex items-center justify-center shrink-0 shadow-sm">
                                    <AlertTriangle size={24} className="text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-orange-900 text-sm uppercase tracking-widest mb-2">Trung tâm Cảnh báo</h4>
                                    <p className="text-[11px] text-orange-700 font-bold uppercase tracking-wider leading-relaxed mb-6 opacity-70">
                                        Gửi lời nhắc nhở trực tiếp đến hệ thống thông báo của sinh viên đối với các nhóm có tiến độ chậm hoặc thiếu hụt commit/task Jira.
                                    </p>
                                    <Button
                                        className="bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-2xl h-11 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-200"
                                        disabled={isSendingAlert}
                                        onClick={() => {
                                            sendAlert(
                                                { groupId: Number(groupId), message: "Cảnh báo khẩn: Yêu cầu cập nhật tiến độ nhóm!", severity: "HIGH" },
                                                {
                                                    onSuccess: () => success("Đã gửi cảnh báo đến nhóm"),
                                                    onError: (err) => error("Lỗi khi gửi cảnh báo: " + err.message)
                                                }
                                            )
                                        }}
                                    >
                                        <AlertTriangle size={13} className="mr-2" />
                                        {isSendingAlert ? "Đang gửi..." : "Gửi cảnh báo ngay"}
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

function InfoRow({ label, value }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">{label}</label>
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 shadow-inner">{value}</div>
        </div>
    );
}

function LinkApprovalSection({ icon, label, url, status, onApprove, onReject }) {
    const isApproved = status === "APPROVED";
    const isRejected = status === "REJECTED";
    const isPending = status === "PENDING";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">{icon}</div>
                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{label}</span>
                </div>
                <StatusBadge 
                    status={isApproved ? 'success' : isRejected ? 'danger' : 'warning'} 
                    label={isApproved ? 'Đã duyệt' : isRejected ? 'Từ chối' : 'Chờ duyệt'} 
                />
            </div>

            <div className="flex gap-3">
                <div className={`flex-1 flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all ${
                    url ? isApproved ? "bg-white border-green-200 shadow-sm" : isRejected ? "bg-red-50 border-red-200" : "bg-gray-50/50 border-gray-100" : "bg-gray-50 border-gray-50 italic"
                }`}>
                    {url ? (
                        <>
                            <span className="truncate flex-1 text-xs font-bold text-gray-600">{url}</span>
                            <a href={url} target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition-transform ${isRejected ? 'text-red-400' : 'text-teal-500'}`}>
                                <ExternalLink size={16} />
                            </a>
                        </>
                    ) : (
                        <span className="text-[10px] font-black text-gray-300 uppercase">Chưa cung cấp liên kết</span>
                    )}
                </div>
                
                {url && (isPending || isRejected) && (
                    <Button onClick={onApprove} className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-6 h-12 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-100 border-0 transition-all">Duyệt</Button>
                )}
                {url && (isPending || isApproved) && (
                    <Button onClick={onReject} variant="outline" className="bg-white hover:bg-red-50 text-red-600 border border-red-100 hover:border-red-200 rounded-2xl px-6 h-12 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all">Từ chối</Button>
                )}
            </div>
        </div>
    );
}
