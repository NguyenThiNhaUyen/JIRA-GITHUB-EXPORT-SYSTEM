import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    generateSrsReport,
    generateSrsReportForCourse,
    getDownloadUrl, 
    generateCommitStatisticsReport, 
    generateTeamRosterReport,
    generateTeamRosterForCourse,
    generateActivitySummaryReport,
    getReports,
    reviewSrsStatus
} from '../api/reportApi.js';

export const REPORT_KEYS = {
    all: ['reports'],
    list: (params) => [...REPORT_KEYS.all, 'list', params],
    srs: (projectId) => [...REPORT_KEYS.all, 'srs', projectId],
    download: (reportId) => [...REPORT_KEYS.all, 'download', reportId],
}

/**
 * GET /api/reports?type=SRS&courseId=X hoặc tất cả reports của user
 * params: { projectId?, courseId?, type?, status?, milestone?, page?, pageSize? }
 */
export const useGetReports = (params = {}) => {
    return useQuery({
        queryKey: REPORT_KEYS.list(params),
        queryFn: () => getReports(params),
        staleTime: 30000,
    });
};

export const useGenerateSrsReport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, format }) => generateSrsReport(projectId, format),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: REPORT_KEYS.all }),
    });
};

export const useGenerateSrsReportForCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ courseId, format }) => generateSrsReportForCourse(courseId, format),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: REPORT_KEYS.all }),
    });
};

export const useGenerateCommitStats = () => {
    return useMutation({
        mutationFn: ({ courseId, format }) => generateCommitStatisticsReport(courseId, format),
    });
};

export const useGenerateTeamRoster = () => {
    return useMutation({
        mutationFn: ({ projectId, format }) => generateTeamRosterReport(projectId, format),
    });
};

export const useGenerateTeamRosterForCourse = () => {
    return useMutation({
        mutationFn: ({ courseId, format }) => generateTeamRosterForCourse(courseId, format),
    });
};

export const useGenerateActivitySummary = () => {
    return useMutation({
        mutationFn: ({ projectId, startDate, endDate, format }) => generateActivitySummaryReport(projectId, startDate, endDate, format),
    });
};

/**
 * PUT /api/reports/{id}/status — Review SRS status (Lecturer/Admin)
 */
export const useReviewSrsStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, status, feedback }) => reviewSrsStatus(reportId, status, feedback),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: REPORT_KEYS.all }),
    });
};

export const useGetDownloadUrl = (reportId) => {
    return useQuery({
        queryKey: REPORT_KEYS.download(reportId),
        queryFn: () => getDownloadUrl(reportId),
        enabled: !!reportId,
        refetchInterval: (query) => {
            // Keep refetching every 3.5s if the report is generating but URL isn't ready
            return query.state.data?.downloadUrl ? false : 3500;
        }
    });
};
