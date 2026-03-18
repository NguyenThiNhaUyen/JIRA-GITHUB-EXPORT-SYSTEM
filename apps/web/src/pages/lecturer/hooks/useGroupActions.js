import { useToast } from "@/components/ui/Toast.jsx";
import {
    useApproveIntegration,
    useRejectIntegration,
    useUpdateTeamMember,
} from "@/features/projects/hooks/useProjects.js";
import { useGenerateSrsReport } from "@/features/projects/hooks/useReports.js";
import { getDownloadUrl } from "@/features/projects/api/reportApi.js";
import { useSendAlert } from "@/features/system/hooks/useAlerts.js";

export function useGroupActions(groupId) {
    const { success, error: showError } = useToast();

    // Mutations
    const approveMutation = useApproveIntegration();
    const rejectMutation = useRejectIntegration();
    const updateMemberMutation = useUpdateTeamMember();
    const generateSrsMutation = useGenerateSrsReport();
    const { mutate: sendAlert, isPending: isSendingAlert } = useSendAlert();

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
            { projectId: groupId, studentId, contributionScore: numScore },
            {
                onSuccess: () => success(`Đã lưu điểm ${numScore} cho sinh viên`)
            }
        );
    };

    const handleExportCsv = (group, students) => {
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

    const handleExportSrs = async (group) => {
        try {
            success("Đang tổng hợp dữ liệu từ Jira & GitHub...");

            // 1. Trigger the backend API to generate SRS
            const res = await generateSrsMutation.mutateAsync({ projectId: groupId, format: "PDF" });
            const reportId = res?.reportId || res?.data?.reportId;

            if (!reportId) {
                showError("Không nhận được mã báo cáo từ server.");
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
                showError("Quá trình tạo file đang bị chậm, vui lòng thử lại sau.");
            }
        } catch (err) {
            showError(err?.message || "Lỗi khi xuất báo cáo SRS");
        }
    };

    const handleSendAlert = (message, severity = "HIGH") => {
        sendAlert(
            { groupId: Number(groupId), message, severity },
            {
                onSuccess: () => success("Đã gửi cảnh báo đến nhóm"),
                onError: (err) => showError("Lỗi khi gửi cảnh báo: " + err.message)
            }
        );
    };

    return {
        handleApproveLink,
        handleRejectLink,
        handleUpdateScore,
        handleExportCsv,
        handleExportSrs,
        handleSendAlert,
        isGeneratingSrs: generateSrsMutation.isPending,
        isSendingAlert
    };
}






