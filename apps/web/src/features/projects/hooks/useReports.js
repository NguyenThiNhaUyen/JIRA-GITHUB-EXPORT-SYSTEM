import { useMutation, useQuery } from '@tanstack/react-query';
import { 
    generateSrsReport, 
    getDownloadUrl, 
    generateCommitStatisticsReport, 
    generateTeamRosterReport, 
    generateActivitySummaryReport 
} from '../api/reportApi.js';

export const REPORT_KEYS = {
    all: ['reports'],
    srs: (projectId) => [...REPORT_KEYS.all, 'srs', projectId],
    download: (reportId) => [...REPORT_KEYS.all, 'download', reportId],
}

export const useGenerateSrsReport = () => {
    return useMutation({
        mutationFn: ({ projectId, format }) => generateSrsReport(projectId, format),
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

export const useGenerateActivitySummary = () => {
    return useMutation({
        mutationFn: ({ projectId, startDate, endDate, format }) => generateActivitySummaryReport(projectId, startDate, endDate, format),
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






