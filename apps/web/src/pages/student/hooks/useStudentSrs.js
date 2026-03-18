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
        if (!selectedProject) return showError("Vui lĂ²ng chá»n dá»± Ă¡n");
        if (!file) return showError("Vui lĂ²ng chá»n file tĂ i liá»‡u");

        submitSrsMutation.mutate({ 
            projectId: selectedProject, 
            file,
            version,
            isFinal
        }, {
            onSuccess: () => {
                success("ÄĂ£ ná»™p tĂ i liá»‡u SRS thĂ nh cĂ´ng!");
                setIsModalOpen(false);
                setFile(null);
                setSelectedProject("");
                setVersion("1.0.0");
                setIsFinal(false);
            },
            onError: () => showError("Ná»™p tháº¥t báº¡i. Vui lĂ²ng thá»­ láº¡i.")
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

