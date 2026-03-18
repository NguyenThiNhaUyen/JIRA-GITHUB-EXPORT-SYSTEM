import { useQuery, useMutation, useQueries } from "@tanstack/react-query";
import {
    generateCommitStats,
    generateTeamRoster,
    generateActivitySummary,
    generateSrs,
    getReportDownloadLink,
    getMyReports,
    getReports,
    updateReportStatus
} from "../api/reportApi.js";

/**
 * Hook Mutation cho: TẠO Commit Statistics
 */
export function useGenerateCommitStats() {
    return useMutation({
        mutationFn: ({ courseId, format }) => generateCommitStats(courseId, format),
    });
}

/**
 * Hook Mutation cho: TẠO Team Roster
 */
export function useGenerateTeamRoster() {
    return useMutation({
        mutationFn: (payload) => generateTeamRoster(payload),
    });
}

/**
 * Hook Mutation cho: TẠO Activity Summary
 */
export function useGenerateActivitySummary() {
    return useMutation({
        mutationFn: ({ projectId, startDate, endDate, format }) => generateActivitySummary(projectId, startDate, endDate, format),
    });
}

/**
 * Hook Mutation cho: TẠO SRS Report (Iso29148 Jira)
 */
export function useGenerateSrs() {
    return useMutation({
        mutationFn: (payload) => generateSrs(payload),
    });
}

/**
 * Hook Query cho: Lấy link download
 */
export function useGetReportDownloadLink(reportId, options = {}) {
    return useQuery({
        queryKey: ["reports", reportId, "download"],
        queryFn: () => getReportDownloadLink(reportId),
        enabled: !!reportId && options.enabled !== false,
        ...options
    });
}

/**
 * Hook Query cho: Get My Reports
 */
export function useGetMyReports(options = {}) {
    return useQuery({
        queryKey: ["reports", "me"],
        queryFn: getMyReports,
        ...options
    });
}

/**
 * Hook Query cho: Lấy danh sách báo cáo hỗ trợ filter
 */
export function useGetReports(filters = {}, options = {}) {
    return useQuery({
        queryKey: ["reports", filters],
        queryFn: () => getReports(filters),
        ...options
    });
}

/**
 * Hook Query cho: Get Reports by Project (Legacy wrapper)
 */
export function useGetProjectReports(projectId, type, options = {}) {
    return useGetReports({ projectId, type }, options);
}

/**
 * Hook Mutation cho: Update Report Status
 */
export function useUpdateReportStatus() {
    return useMutation({
        mutationFn: ({ reportId, status }) => updateReportStatus(reportId, status),
    });
}

/**
 * Hook Queries cho: Get Reports của nhiều Project cùng lúc (Legacy - nên dùng useGetReports)
 */
export function useCourseProjectReports(projectIds, type) {
    return useQueries({
        queries: (projectIds || []).map(id => ({
            queryKey: ["reports", "project", id, type],
            queryFn: () => getReports({ projectId: id, type }),
            enabled: !!id,
        }))
    });
}
