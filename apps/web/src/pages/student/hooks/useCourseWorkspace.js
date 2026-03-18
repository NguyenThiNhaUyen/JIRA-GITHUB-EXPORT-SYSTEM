import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/components/ui/Toast.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { useGetEnrolledStudents, useGetCourseById } from "@/features/courses/hooks/useCourses.js";
import { 
    useAddTeamMember, 
    useGetProjectMetrics, 
    useGetProjects, 
    useLinkIntegration,
    useSyncProjectCommits,
    useRemoveTeamMember
} from "@/features/projects/hooks/useProjects.js";
import { useGetProjectSrs } from "@/features/srs/hooks/useSrs.js";

export function useCourseWorkspace(courseId) {
    const { user } = useAuth();
    const userId = user?.id;
    const { success, error: showError } = useToast();

    // Data Fetching
    const { data: course, isLoading: loadingCourse } = useGetCourseById(courseId);
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects({ courseId });
    
    const group = useMemo(() => {
        return projectsData?.items?.find(p => String(p.courseId) === String(courseId) || String(p.course?.id) === String(courseId)) || null;
    }, [projectsData, courseId]);

    const { data: groupSrs = [], isLoading: loadingSrs } = useGetProjectSrs(group?.id);
    const { data: enrolledData = { items: [] }, isFetching: isEnrolledFetching } = useGetEnrolledStudents(courseId, { pageSize: 500 });
    const { data: metrics, isLoading: loadingMetrics } = useGetProjectMetrics(group?.id);

    const groupStudents = group?.team || [];
    const myMember = groupStudents.find(m => String(m.studentId) === String(userId));
    const isLeader = myMember?.role === 'LEADER';

    const [githubInput, setGithubInput] = useState("");
    const [jiraInput, setJiraInput] = useState("");
    
    // Initial state setup when data loads
    useEffect(() => {
        if (group?.integration) {
            setGithubInput(group.integration.githubRepo || "");
            setJiraInput(group.integration.jiraKey || "");
        }
    }, [group]);

    // Mutations
    const { mutateAsync: addMemberMutateAsync, isPending: isAddingMember } = useAddTeamMember();
    const { mutateAsync: removeMemberMutateAsync, isPending: isRemovingMember } = useRemoveTeamMember();
    const linkIntegrationMutation = useLinkIntegration();
    const syncCommitsMutation = useSyncProjectCommits();

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteSelectedIds, setInviteSelectedIds] = useState([]);
    const [isInviting, setIsInviting] = useState(false);

    const handleInviteSubmit = async () => {
        if (inviteSelectedIds.length === 0) return;
        setIsInviting(true);
        let successCount = 0;
        for (const studentId of inviteSelectedIds) {
            try {
                await addMemberMutateAsync({
                    projectId: group.id,
                    studentId: studentId,
                    role: "MEMBER",
                    responsibility: "Thành viên"
                });
                successCount++;
            } catch (err) {}
        }
        setIsInviting(false);
        if (successCount > 0) success(`Đã thêm ${successCount} thành viên!`);
        setShowInviteModal(false);
        setInviteSelectedIds([]);
    };

    const handleLinkSubmit = () => {
        linkIntegrationMutation.mutate({
            projectId: group.id,
            body: { githubRepo: githubInput, jiraKey: jiraInput }
        }, {
            onSuccess: () => success("Đã gửi yêu cầu liên kết tích hợp!")
        });
    };

    const handleSync = () => {
        syncCommitsMutation.mutate(group.id, {
            onSuccess: () => success("Đã đồng bộ dữ liệu mới nhất từ GitHub/Jira")
        });
    };

    const handleRemoveMember = async (studentId) => {
        try {
            await removeMemberMutateAsync({ projectId: group.id, studentId });
            success("Đã xóa thành viên khỏi nhóm");
        } catch (err) {
            showError(err.message || "Xóa thành viên thất bại");
        }
    };

    return {
        course,
        courseId,
        loadingCourse,
        group,
        loadingProjects,
        groupStudents,
        groupSrs,
        loadingSrs,
        enrolledData,
        isEnrolledFetching,
        metrics,
        loadingMetrics,
        isLeader,
        githubInput,
        setGithubInput,
        jiraInput,
        setJiraInput,
        showInviteModal,
        setShowInviteModal,
        inviteSelectedIds,
        setInviteSelectedIds,
        isInviting,
        isLinking: linkIntegrationMutation.isPending,
        isSyncing: syncCommitsMutation.isPending,
        handleInviteSubmit,
        handleLinkSubmit,
        handleSync,
        handleRemoveMember
    };
}






