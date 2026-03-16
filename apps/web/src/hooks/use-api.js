// Custom hooks cho API calls với TanStack Query
import { useQuery } from "@tanstack/react-query";
import { useApp } from "../context/AppContext.jsx";
import { getStudentDashboardStats, getLecturerCoursesStats, getLecturerActivityLogs, getGroupRadarMetrics } from "../features/analytics/api/analyticsApi.js";
import { getProjectCommits, getProjectCommitHistory } from "../features/github/api/githubApi.js";
import { getProjectMetrics } from "../features/projects/api/projectApi.js";


// TODO: context backend API endpoint implementation for context hooks
export function useContext() {
  return useQuery({
    queryKey: ["context"],
    queryFn: () => ({ /* Placeholder for Context API implementation */ }),
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


