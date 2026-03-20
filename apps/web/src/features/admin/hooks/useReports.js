import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    generateCommitStats,
    generateTeamRoster,
    generateActivitySummary,
    generateSrs,
    getReportDownloadLink,
    getMyReports
} from "../api/reportApi.js";
import { remindOverdueSrs } from "../../system/api/alertApi.js";

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
}/**
 * Hook Mutation cho: Cập nhật trạng thái báo cáo (Admin)
 * PUT /api/reports/:id/status
 */
export function useUpdateReportStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }) => {
            const client = (await import('../../../api/client.js')).default;
            const { unwrap } = await import('../../../api/unwrap.js');
            const res = await client.put(`/reports/${id}/status`, { status });
            return unwrap(res);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
}

/**
 * Hook Mutation: Nhắc nhở nộp SRS quá hạn (Lecturer/Admin)
 * POST /api/srs/remind-overdue
 */
export function useRemindOverdueSrs() {
    return useMutation({
        mutationFn: remindOverdueSrs,
    });
}
