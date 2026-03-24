import { useQuery } from "@tanstack/react-query";
import {
  getProjectById,
  getProjectMetrics,
  getProjectKanban,
  getProjectCfd,
  getProjectRoadmap,
  getProjectAgingWip,
  getProjectCycleTime,
  getProjectCommits,
  getProjectCommitHistory,
} from "../features/projects/api/projectApi.js";

export function useContext(projectId) {
  return useQuery({
    queryKey: ["project", "context", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDashboardSummary(projectId) {
  return useQuery({
    queryKey: ["dashboard", "summary", projectId],
    queryFn: () => getProjectMetrics(projectId),
    enabled: !!projectId,
  });
}

export function useDashboardTrends(projectId) {
  return useQuery({
    queryKey: ["dashboard", "trends", projectId],
    queryFn: () => getProjectCommitHistory(projectId),
    enabled: !!projectId,
  });
}

export function useHeatmap(projectId) {
  return useQuery({
    queryKey: ["dashboard", "heatmap", projectId],
    queryFn: () => getProjectCommitHistory(projectId),
    enabled: !!projectId,
  });
}

export function useTasksBoard(projectId) {
  return useQuery({
    queryKey: ["tasks", "board", projectId],
    queryFn: () => getProjectKanban(projectId),
    enabled: !!projectId,
  });
}

export function useCfd(projectId) {
  return useQuery({
    queryKey: ["tasks", "cfd", projectId],
    queryFn: () => getProjectCfd(projectId),
    enabled: !!projectId,
  });
}

export function useCycleTime(projectId) {
  return useQuery({
    queryKey: ["tasks", "cycle-time", projectId],
    queryFn: () => getProjectCycleTime(projectId),
    enabled: !!projectId,
  });
}

export function useAgingWip(projectId, limit = 5) {
  return useQuery({
    queryKey: ["tasks", "aging-wip", projectId, limit],
    queryFn: () => getProjectAgingWip(projectId, limit),
    enabled: !!projectId,
  });
}

export function useCommitsList(projectId, params = {}) {
  return useQuery({
    queryKey: ["commits", "list", projectId, params],
    queryFn: () => getProjectCommits(projectId, params),
    enabled: !!projectId,
  });
}

export function useCommitsFrequency(projectId) {
  return useQuery({
    queryKey: ["commits", "frequency", projectId],
    queryFn: () => getProjectCommitHistory(projectId),
    enabled: !!projectId,
  });
}

export function useCodeChanges(projectId) {
  return useQuery({
    queryKey: ["commits", "code-changes", projectId],
    queryFn: () => getProjectCommitHistory(projectId),
    enabled: !!projectId,
  });
}

export function useDeadlinesRoadmap(projectId) {
  return useQuery({
    queryKey: ["deadlines", "roadmap", projectId],
    queryFn: () => getProjectRoadmap(projectId),
    enabled: !!projectId,
  });
}

export function useDeadlinesDistribution(projectId) {
  return useQuery({
    queryKey: ["deadlines", "distribution", projectId],
    queryFn: () => getProjectRoadmap(projectId),
    enabled: !!projectId,
  });
}

export function usePerformanceSummary(projectId) {
  return useQuery({
    queryKey: ["performance", "summary", projectId],
    queryFn: () => getProjectMetrics(projectId),
    enabled: !!projectId,
  });
}

export function usePerformanceMembers(projectId) {
  return useQuery({
    queryKey: ["performance", "members", projectId],
    queryFn: () => getProjectMetrics(projectId),
    enabled: !!projectId,
  });
}

export function usePerformanceTrends(projectId) {
  return useQuery({
    queryKey: ["performance", "trends", projectId],
    queryFn: () => getProjectCommitHistory(projectId),
    enabled: !!projectId,
  });
}


