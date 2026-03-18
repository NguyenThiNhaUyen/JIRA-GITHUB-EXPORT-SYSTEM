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
            onSuccess: () => success(`ÄĂ£ duyá»‡t tĂ­ch há»£p cho nhĂ³m`)
        });
    };

    const handleRejectLink = () => {
        const reason = prompt("Nháº­p lĂ½ do tá»« chá»‘i:");
        if (reason === null) return;
        rejectMutation.mutate(
            { projectId: groupId, reason },
            {
                onSuccess: () => success(`ÄĂ£ tá»« chá»‘i tĂ­ch há»£p cho nhĂ³m`)
            }
        );
    };

    const handleUpdateScore = (studentId, score) => {
        const numScore = parseInt(score, 10);
        if (isNaN(numScore) || numScore < 0 || numScore > 100) {
            showError("Äiá»ƒm pháº£i tá»« 0 Ä‘áº¿n 100");
            return;
        }

        updateMemberMutation.mutate(
            { projectId: groupId, studentId, contributionScore: numScore },
            {
                onSuccess: () => success(`ÄĂ£ lÆ°u Ä‘iá»ƒm ${numScore} cho sinh viĂªn`)
            }
        );
    };

    const handleExportCsv = (group, students) => {
        try {
            const headers = ["MSSV", "Há» TĂªn", "Vai TrĂ²", "Äiá»ƒm ÄĂ³ng GĂ³p"];
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
            success("ÄĂ£ xuáº¥t danh sĂ¡ch thĂ nh viĂªn thĂ nh cĂ´ng!");
        } catch (err) {
            showError("Lá»—i khi xuáº¥t file");
        }
    };

    const handleExportSrs = async (group) => {
        try {
            success("Äang tá»•ng há»£p dá»¯ liá»‡u tá»« Jira & GitHub...");

            // 1. Trigger the backend API to generate SRS
            const res = await generateSrsMutation.mutateAsync({ projectId: groupId, format: "PDF" });
            const reportId = res?.reportId || res?.data?.reportId;

            if (!reportId) {
                showError("KhĂ´ng nháº­n Ä‘Æ°á»£c mĂ£ bĂ¡o cĂ¡o tá»« server.");
                return;
            }

            // 2. Poll the download URL (in a real app, you can use the polling hook, but here we manually retry)
            success("Äang táº¡o PDF, vui lĂ²ng chá» trong giĂ¢y lĂ¡t...");

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
                success("ÄĂ£ táº£i xuá»‘ng bĂ¡o cĂ¡o SRS thĂ nh cĂ´ng!");
            } else {
                showError("QuĂ¡ trĂ¬nh táº¡o file Ä‘ang bá»‹ cháº­m, vui lĂ²ng thá»­ láº¡i sau.");
            }
        } catch (err) {
            showError(err?.message || "Lá»—i khi xuáº¥t bĂ¡o cĂ¡o SRS");
        }
    };

    const handleSendAlert = (message, severity = "HIGH") => {
        sendAlert(
            { groupId: Number(groupId), message, severity },
            {
                onSuccess: () => success("ÄĂ£ gá»­i cáº£nh bĂ¡o Ä‘áº¿n nhĂ³m"),
                onError: (err) => showError("Lá»—i khi gá»­i cáº£nh bĂ¡o: " + err.message)
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
