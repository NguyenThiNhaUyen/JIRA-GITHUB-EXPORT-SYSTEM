import { useQuery } from "@tanstack/react-query";
import { 
  getAnalyticsStats, 
  getCommitTrends, 
  getAnalyticsHeatmap 
} from "../features/dashboard/api/analyticsApi.js";
import { useApp } from "../context/AppContext.jsx";
import { getStudentDashboardStats, getLecturerCoursesStats, getLecturerActivityLogs, getGroupRadarMetrics } from "../features/analytics/api/analyticsApi.js";
import { getProjectCommits, getProjectCommitHistory } from "../features/github/api/githubApi.js";
import { getProjectMetrics, getProjectKanban, getProjectCfd, getProjectRoadmap, getProjectAgingWip, getProjectCycleTime } from "../features/projects/api/projectApi.js";
import { commitService } from "../services/commitService.js";


// TODO: context backend API endpoint implementation for context hooks
export function useContext() {
  return useQuery({
    queryKey: ["context"],
    queryFn: () => ({
      semesters: [],
      weeks: [],
      repos: [],
      members: []
    }),
    staleTime: 5 * 60 * 1000,
  });
}

// Analytics and Dashboard Hooks
export function useStudentDashboardStats() {
    return useQuery({
        queryKey: ["analytics", "student", "stats"],
        queryFn: () => getStudentDashboardStats(),
    });
}

export function useLecturerCoursesStats() {
    return useQuery({
        queryKey: ["analytics", "lecturer", "courses"],
        queryFn: () => getLecturerCoursesStats(),
    });
}

export function useLecturerActivityLogs(limit = 10) {
    return useQuery({
        queryKey: ["analytics", "lecturer", "activity-logs", limit],
        queryFn: () => getLecturerActivityLogs(limit),
    });
}

export function useGroupRadarMetrics(courseId) {
    return useQuery({
        queryKey: ["analytics", "radar", courseId],
        queryFn: () => getGroupRadarMetrics(courseId),
        enabled: !!courseId
    });
}

// GitHub & Project Hooks
export function useProjectCommits(projectId, page = 1, pageSize = 50) {
    return useQuery({
        queryKey: ["github", "commits", projectId, page, pageSize],
        queryFn: () => getProjectCommits(projectId, page, pageSize),
        enabled: !!projectId
    });
}

export function useProjectCommitHistory(projectId) {
    return useQuery({
        queryKey: ["github", "commit-history", projectId],
        queryFn: () => getProjectCommitHistory(projectId),
        enabled: !!projectId
    });
}

export function useProjectMetrics(projectId) {
    return useQuery({
        queryKey: ["projects", "metrics", projectId],
        queryFn: () => getProjectMetrics(projectId),
        enabled: !!projectId
    });
}

export function useDashboardSummary() {
  const { weekId, repoId } = useApp();
  return useQuery({
    queryKey: ["dashboard", "summary", weekId, repoId],
    queryFn: async () => {
       const stats = await getAnalyticsStats();
       return {
         totalCommits: stats.totalCommits || 0,
         totalIssues: stats.totalIssues || 0,
         tasksCompleted: stats.completedIssues || 0,
         activeMembers: stats.activeMembers || 0,
         deltas: { commits: 0, issues: 0, tasks: 0, members: 0 },
       };
    },
  });
}

export function useDashboardTrends() {
  const { weekId, repoId } = useApp();
  return useQuery({
    queryKey: ["dashboard", "trends", weekId, repoId],
    queryFn: async () => {
      const trends = await getCommitTrends(7);
      return {
        buckets: trends.map(t => ({
          date: t.date,
          commits: t.commits,
          issuesClosed: 0,
          tasksDone: 0,
          wip: 0
        }))
      };
    },
  });
}

export function useHeatmap(memberId) {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["dashboard", "heatmap", repoId, memberId],
    queryFn: () => getAnalyticsHeatmap(90),
  });
}

export function useTasksBoard(projectId) {
  return useQuery({
    queryKey: ["tasks", "board", projectId],
    queryFn: () => getProjectKanban(projectId),
    enabled: !!projectId
  });
}

export function useCfd(projectId) {
  return useQuery({
    queryKey: ["tasks", "cfd", projectId],
    queryFn: () => getProjectCfd(projectId),
    enabled: !!projectId
  });
}

export function useCycleTime(projectId) {
  return useQuery({
    queryKey: ["tasks", "cycle-time", projectId],
    queryFn: () => getProjectCycleTime(projectId),
    enabled: !!projectId
  });
}

export function useAgingWip(projectId, limit = 5) {
  return useQuery({
    queryKey: ["tasks", "aging-wip", projectId, limit],
    queryFn: () => getProjectAgingWip(projectId, limit),
    enabled: !!projectId
  });
}

export function useCommitsList(params = {}) {
  return useQuery({
    queryKey: ["commits", "list", params],
    queryFn: async () => {
      const data = await commitService.getCommits(params);
      return { items: data.items || data || [], total: data.total || data.length || 0 };
    },
  });
}

export function useCommitsFrequency() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["commits", "frequency", repoId],
    queryFn: () => ({ buckets: [] }),
  });
}

export function useCodeChanges() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["commits", "code-changes", repoId],
    queryFn: () => ({ buckets: [] }),
  });
}

export function useDeadlinesRoadmap(projectId) {
  return useQuery({
    queryKey: ["deadlines", "roadmap", projectId],
    queryFn: () => getProjectRoadmap(projectId),
    enabled: !!projectId
  });
}

export function useDeadlinesDistribution() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["deadlines", "distribution", repoId],
    queryFn: () => ({ buckets: [] }),
  });
}

export function usePerformanceSummary() {
  const { weekId, repoId } = useApp();
  return useQuery({
    queryKey: ["performance", "summary", weekId, repoId],
    queryFn: () => ({ productivity: 0, efficiency: 0, quality: 0, engagement: 0 }),
  });
}

export function usePerformanceMembers() {
  const { weekId, repoId } = useApp();
  return useQuery({
    queryKey: ["performance", "members", weekId, repoId],
    queryFn: () => ({ rows: [] }),
  });
}

export function usePerformanceTrends() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["performance", "trends", repoId],
    queryFn: () => ({ buckets: [] }),
  });
}




