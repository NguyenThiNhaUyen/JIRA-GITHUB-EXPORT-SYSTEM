// Custom hooks cho API calls với TanStack Query
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/mock-client.js";
import { useApp } from "../context/AppContext.jsx";

export function useContext() {
  return useQuery({
    queryKey: ["context"],
    queryFn: () => api.getContext(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDashboardSummary() {
  const { weekId, repoId } = useApp();
  return useQuery({
    queryKey: ["dashboard", "summary", weekId, repoId],
    queryFn: () => api.getDashboardSummary({ weekId, repoId }),
  });
}

export function useDashboardTrends() {
  const { weekId, repoId } = useApp();
  return useQuery({
    queryKey: ["dashboard", "trends", weekId, repoId],
    queryFn: () => api.getDashboardTrends({ weekId, repoId }),
  });
}

export function useHeatmap(memberId) {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["dashboard", "heatmap", repoId, memberId],
    queryFn: () => api.getHeatmap({ repoId, memberId }),
  });
}

export function useTasksBoard() {
  const { weekId, repoId } = useApp();
  return useQuery({
    queryKey: ["tasks", "board", weekId, repoId],
    queryFn: () => api.getTasksBoard({ weekId, repoId }),
  });
}

export function useCfd() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["tasks", "cfd", repoId],
    queryFn: () => api.getCfd({ repoId }),
  });
}

export function useCycleTime() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["tasks", "cycle-time", repoId],
    queryFn: () => api.getCycleTime({ repoId }),
  });
}

export function useAgingWip(limit = 5) {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["tasks", "aging-wip", repoId, limit],
    queryFn: () => api.getAgingWip({ repoId, limit }),
  });
}

export function useCommitsList(params = {}) {
  return useQuery({
    queryKey: ["commits", "list", params],
    queryFn: () => api.getCommitsList(params),
  });
}

export function useCommitsFrequency() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["commits", "frequency", repoId],
    queryFn: () => api.getCommitsFrequency({ repoId }),
  });
}

export function useCodeChanges() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["commits", "code-changes", repoId],
    queryFn: () => api.getCodeChanges({ repoId }),
  });
}

export function useDeadlinesRoadmap() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["deadlines", "roadmap", repoId],
    queryFn: () => api.getDeadlinesRoadmap({ repoId }),
  });
}

export function useDeadlinesDistribution() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["deadlines", "distribution", repoId],
    queryFn: () => api.getDeadlinesDistribution({ repoId }),
  });
}

export function usePerformanceSummary() {
  const { weekId, repoId } = useApp();
  return useQuery({
    queryKey: ["performance", "summary", weekId, repoId],
    queryFn: () => api.getPerformanceSummary({ weekId, repoId }),
  });
}

export function usePerformanceMembers() {
  const { weekId, repoId } = useApp();
  return useQuery({
    queryKey: ["performance", "members", weekId, repoId],
    queryFn: () => api.getPerformanceMembers({ weekId, repoId }),
  });
}

export function usePerformanceTrends() {
  const { repoId } = useApp();
  return useQuery({
    queryKey: ["performance", "trends", repoId],
    queryFn: () => api.getPerformanceTrends({ repoId }),
  });
}


