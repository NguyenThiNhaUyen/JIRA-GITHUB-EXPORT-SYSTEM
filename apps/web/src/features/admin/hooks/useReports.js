import { useQuery, useMutation } from "@tanstack/react-query";
import {
    generateCommitStats,
    generateTeamRoster,
    generateActivitySummary,
    generateSrs,
    getReportDownloadLink,
    getMyReports
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
        mutationFn: ({ projectId, format }) => generateTeamRoster(projectId, format),
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
        mutationFn: ({ projectId, format }) => generateSrs(projectId, format),
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
