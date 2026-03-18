import { useState } from "react";
import { useAuth } from "@/context/AuthContext.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { useStudentProjects } from "@/features/dashboard/hooks/useDashboard.js";
import { useSubmitSrs } from "@/features/srs/hooks/useSrs.js";

export function useStudentSrs() {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const { data: projectsData, isLoading: loadingProjects } = useStudentProjects();
    const myGroups = projectsData?.items || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState("");
    const [file, setFile] = useState(null);
    const [version, setVersion] = useState("1.0.0");
    const [isFinal, setIsFinal] = useState(false);

    const submitSrsMutation = useSubmitSrs();

    const handleUpload = () => {
        if (!selectedProject) return showError("Vui lòng chọn dự án");
        if (!file) return showError("Vui lòng chọn file tài liệu");

        submitSrsMutation.mutate({ 
            projectId: selectedProject, 
            file,
            version,
            isFinal
        }, {
            onSuccess: () => {
                success("Đã nộp tài liệu SRS thành công!");
                setIsModalOpen(false);
                setFile(null);
                setSelectedProject("");
                setVersion("1.0.0");
                setIsFinal(false);
            },
            onError: () => showError("Nộp thất bại. Vui lòng thử lại.")
        });
    };

    return {
        user,
        loadingProjects,
        myGroups,
        isModalOpen,
        setIsModalOpen,
        selectedProject,
        setSelectedProject,
        file,
        setFile,
        version,
        setVersion,
        isFinal,
        setIsFinal,
        isSubmitting: submitSrsMutation.isPending,
        handleUpload
    };
}






