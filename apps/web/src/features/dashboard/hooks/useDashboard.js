import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as studentApi from "../api/studentApi.js";
import * as lecturerApi from "../api/lecturerApi.js";
import * as adminApi from "../api/adminApi.js";
import * as analyticsApi from "../api/analyticsApi.js";

/* ── STUDENT DASHBOARD HOOKS ── */

export function useStudentStats() {
    return useQuery({
        queryKey: ["student", "stats"],
        queryFn: studentApi.getStudentStats
    });
}

export function useStudentHeatmap(days = 35) {
    return useQuery({
        queryKey: ["student", "heatmap", days],
        queryFn: () => studentApi.getStudentHeatmap(days)
    });
}

export function useStudentCommitActivity(days = 7) {
    return useQuery({
        queryKey: ["student", "commit-activity", days],
        queryFn: () => studentApi.getStudentCommitActivity(days)
    });
}

export function useStudentDeadlines() {
    return useQuery({
        queryKey: ["student", "deadlines"],
        queryFn: studentApi.getStudentDeadlines
    });
}

/* ── LECTURER DASHBOARD HOOKS ── */

export function useLecturerWorkload(lecturerId) {
    return useQuery({
        queryKey: ["lecturer", "workload", lecturerId],
        queryFn: () => lecturerApi.getLecturerWorkload(lecturerId),
        enabled: !!lecturerId
    });
}

export function useLecturerActivityLogs(limit = 5) {
    return useQuery({
        queryKey: ["lecturer", "activity-logs", limit],
        queryFn: () => lecturerApi.getLecturerActivityLogs(limit)
    });
}

/* ── ADMIN & SHARED ANALYTICS HOOKS ── */

export function useAdminStats() {
    return useQuery({
        queryKey: ["analytics", "stats"],
        queryFn: analyticsApi.getAnalyticsStats
    });
}

export function useIntegrationStats() {
    return useQuery({
        queryKey: ["analytics", "integration-stats"],
        queryFn: analyticsApi.getIntegrationStats
    });
}

export function useCommitTrends(days = 7) {
    return useQuery({
        queryKey: ["analytics", "commit-trends", days],
        queryFn: () => analyticsApi.getCommitTrends(days)
    });
}

export function useAnalyticsHeatmap(days = 90) {
    return useQuery({
        queryKey: ["analytics", "heatmap", days],
        queryFn: () => analyticsApi.getAnalyticsHeatmap(days)
    });
}

export function useAnalyticsRadar(courseId) {
    return useQuery({
        queryKey: ["analytics", "radar", courseId],
        queryFn: () => analyticsApi.getAnalyticsRadar(courseId),
        enabled: !!courseId
    });
}

export function useTeamRankings(limit = 4) {
    return useQuery({
        queryKey: ["analytics", "team-rankings", limit],
        queryFn: () => analyticsApi.getTeamRankings(limit)
    });
}

export function useInactiveTeams() {
    return useQuery({
        queryKey: ["analytics", "inactive-teams"],
        queryFn: analyticsApi.getInactiveTeams
    });
}

export function useTeamActivities() {
    return useQuery({
        queryKey: ["analytics", "team-activities"],
        queryFn: analyticsApi.getTeamActivities
    });
}

export function useActivityLog(limit = 10) {
    return useQuery({
        queryKey: ["analytics", "activity-log", limit],
        queryFn: () => analyticsApi.getActivityLog(limit)
    });
}

export function useLecturerAnalyticsCourses() {
    return useQuery({
        queryKey: ["analytics", "lecturer", "courses"],
        queryFn: analyticsApi.getLecturerCourses
    });
}

/* ── MUTATIONS ── */

export function useBulkAssignLecturers() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminApi.bulkAssignLecturers,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        }
    });
}
