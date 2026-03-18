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
            setGithubInput(group.integration.githubRepoUrl || group.integration.githubUrl || "");
            setJiraInput(group.integration.jiraProjectKey || group.integration.jiraUrl || "");
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
                    responsibility: "ThĂ nh viĂªn"
                });
                successCount++;
            } catch (err) {}
        }
        setIsInviting(false);
        if (successCount > 0) success(`ÄĂ£ thĂªm ${successCount} thĂ nh viĂªn!`);
        setShowInviteModal(false);
        setInviteSelectedIds([]);
    };

    const handleLinkSubmit = () => {
        // Ensure github input is a full URL for the backend to parse
        const githubUrl = githubInput.includes("github.com") 
            ? (githubInput.startsWith("http") ? githubInput : `https://${githubInput}`)
            : `https://github.com/${githubInput}`;

        linkIntegrationMutation.mutate({
            projectId: group.id,
            body: { 
                githubRepoUrl: githubUrl, 
                jiraProjectKey: jiraInput,
                jiraSiteUrl: "https://atlassian.net"
            }
        }, {
            onSuccess: () => success("ÄĂ£ gá»­i yĂªu cáº§u liĂªn káº¿t tĂ­ch há»£p!")
        });
    };

    const handleSync = () => {
        syncCommitsMutation.mutate(group.id, {
            onSuccess: () => success("ÄĂ£ Ä‘á»“ng bá»™ dá»¯ liá»‡u má»›i nháº¥t tá»« GitHub/Jira")
        });
    };

    const handleRemoveMember = async (studentId) => {
        try {
            await removeMemberMutateAsync({ projectId: group.id, studentId });
            success("ÄĂ£ xĂ³a thĂ nh viĂªn khá»i nhĂ³m");
        } catch (err) {
            showError(err.message || "XĂ³a thĂ nh viĂªn tháº¥t báº¡i");
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

