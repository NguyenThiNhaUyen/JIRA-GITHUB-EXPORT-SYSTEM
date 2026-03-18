import { useMemo } from "react";
import { 
    useStudentStats, 
    useStudentHeatmap, 
    useStudentCommitActivity,
    useStudentProjects
} from "@/features/dashboard/hooks/useDashboard.js";

export function useStudentContribution() {
    // Data Hooks
    const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useStudentStats();
    const { data: heatmapData, isLoading: loadingHeatmap } = useStudentHeatmap(180); // 6 months
    const { data: commitActivity, isLoading: loadingActivity } = useStudentCommitActivity(14); // 2 weeks
    const { data: projectsData, isLoading: loadingProjects } = useStudentProjects();

    const projects = projectsData?.items || [];
    const isLoading = loadingStats || loadingHeatmap || loadingActivity || loadingProjects;

    // Derived Metrics
    const performanceRadar = useMemo(() => [
        { subject: 'Coding', A: stats?.codingScore || 85, fullMark: 100 },
        { subject: 'Jira Task', A: stats?.taskScore || 70, fullMark: 100 },
        { subject: 'Documentation', A: stats?.docScore || 60, fullMark: 100 },
        { subject: 'Consistency', A: stats?.consistencyScore || 90, fullMark: 100 },
        { subject: 'Collaboration', A: stats?.collabScore || 75, fullMark: 100 },
    ], [stats]);

    const handleRefresh = () => {
        refetchStats();
    };

    return {
        stats,
        heatmapData,
        commitActivity,
        projects,
        isLoading,
        performanceRadar,
        handleRefresh
    };
}






