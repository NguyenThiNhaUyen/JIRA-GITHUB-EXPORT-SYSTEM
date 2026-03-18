import { useState, useMemo } from "react";
import { useToast } from "../../../components/ui/Toast.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import {
    useGetProjectById,
    useGetProjectMetrics,
    useProjectCommitHistory,
    useSyncProjectCommits,
    useGetProjectRoadmap,
    useGetProjectCfd,
    useGetProjectCycleTime,
    useGetProjectKanban,
    useGetProjectAgingWip
} from "../../../features/projects/hooks/useProjects.js";
import { useGetProjectSrs, useSubmitSrs } from "../../../features/srs/hooks/useSrs.js";

export function useStudentProject(projectId) {
    const { user } = useAuth();
    const { success, error: showError } = useToast();

    const [activeTab, setActiveTab] = useState("commits");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);

    // Data Hooks
    const { data: project, isLoading: loadingProject } = useGetProjectById(projectId);
    const { data: metrics, isLoading: loadingMetrics } = useGetProjectMetrics(projectId);
    const { data: commitHistory = [], isLoading: loadingCommits } = useProjectCommitHistory(projectId);
    const { data: srsReports = [], isLoading: loadingSrs } = useGetProjectSrs(projectId);
    const { data: roadmapData } = useGetProjectRoadmap(projectId);
    const { data: cfdData } = useGetProjectCfd(projectId);
    const { data: cycleTime } = useGetProjectCycleTime(projectId);
    const { data: kanban } = useGetProjectKanban(projectId);
    const { data: agingWip } = useGetProjectAgingWip(projectId);

    const { mutate: syncCommits, isPending: isSyncing } = useSyncProjectCommits();
    const { mutate: submitSrs, isPending: isSubmitting } = useSubmitSrs();

    const myTeamMember = useMemo(() =>
        project?.team?.find(m => String(m.studentId) === String(user?.id)),
    [project, user]);

    const myCommits = useMemo(() =>
        commitHistory.filter(c => String(c.authorId || c.studentId) === String(user?.id)),
    [commitHistory, user]);

    const handleSync = () => {
        syncCommits(projectId, {
            onSuccess: () => success("Đồng bộ dữ liệu mã nguồn thành công!"),
            onError: () => showError("Lỗi đồng bộ. Vui lòng kiểm tra lại URL Repo.")
        });
    };

    const handleSrsSubmit = () => {
        if (!uploadFile) return showError("Vui lòng chọn file tài liệu");
        submitSrs({ projectId, file: uploadFile }, {
            onSuccess: () => {
                success("Đã nộp SRS thành công!");
                setIsUploadModalOpen(false);
                setUploadFile(null);
            },
            onError: () => showError("Nộp thất bại. Vui lòng thử lại.")
        });
    };

    return {
        project,
        loadingProject,
        metrics,
        loadingMetrics,
        commitHistory,
        loadingCommits,
        srsReports,
        loadingSrs,
        roadmapData,
        cfdData,
        cycleTime,
        kanban,
        agingWip,
        isSyncing,
        isSubmitting,
        myTeamMember,
        myCommits,
        activeTab,
        setActiveTab,
        isUploadModalOpen,
        setIsUploadModalOpen,
        uploadFile,
        setUploadFile,
        handleSync,
        handleSrsSubmit
    };
}
