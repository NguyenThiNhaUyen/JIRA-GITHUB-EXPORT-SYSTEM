import { useQuery } from "@tanstack/react-query";
import { 
  getAnalyticsStats, 
  getCommitTrends, 
  getAnalyticsHeatmap 
} from "../features/dashboard/api/analyticsApi.js";
import { useApp } from "../context/AppContext.jsx";

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

export function useTasksBoard() {
  const { weekId, repoId } = useApp();
  return useQuery({
    queryKey: ["tasks", "board", weekId, repoId],
    queryFn: () => ({ columns: { todo: [], in_progress: [], done: [] } }),
  });
}

export function useCfd() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["tasks", "cfd", repoId],
    queryFn: () => ({ buckets: [] }),
  });
}

export function useCycleTime() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["tasks", "cycle-time", repoId],
    queryFn: () => ({ histogram: [], medianDays: 0, p75Days: 0 }),
  });
}

export function useAgingWip(limit = 5) {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["tasks", "aging-wip", repoId, limit],
    queryFn: () => ({ items: [] }),
  });
}

import { commitService } from "../services/commitService.js";

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

export function useDeadlinesRoadmap() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["deadlines", "roadmap", repoId],
    queryFn: () => ({ items: [], sprints: [] }),
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


