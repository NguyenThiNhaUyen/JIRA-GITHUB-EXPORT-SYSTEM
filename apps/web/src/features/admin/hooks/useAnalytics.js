import { useQuery } from "@tanstack/react-query";
import {
    getIntegrationStats, getCommitTrends, getSystemHeatmap,
    getGroupRadarMetrics, getTeamRankings, getInactiveTeams,
    getTeamActivities, getActivityLog,
    getLecturerCoursesStats, getLecturerActivityLogs, bulkAssign
} from "../api/analyticsApi.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const ANALYTICS_KEYS = {
    all: ["analytics"],
    integrationStats: () => [...ANALYTICS_KEYS.all, "integration-stats"],
    commitTrends: (days) => [...ANALYTICS_KEYS.all, "commit-trends", days],
    heatmap: (days) => [...ANALYTICS_KEYS.all, "heatmap", days],
    radar: (courseId) => [...ANALYTICS_KEYS.all, "radar", courseId],
    teamRankings: (limit) => [...ANALYTICS_KEYS.all, "team-rankings", limit],
    inactiveTeams: () => [...ANALYTICS_KEYS.all, "inactive-teams"],
    teamActivities: () => [...ANALYTICS_KEYS.all, "team-activities"],
    activityLog: (limit) => [...ANALYTICS_KEYS.all, "activity-log", limit],
    lecturerCourses: () => [...ANALYTICS_KEYS.all, "lecturer-courses"],
    lecturerActivityLogs: (limit) => [...ANALYTICS_KEYS.all, "lecturer-activity-logs", limit],
};

/** Thống kê tích hợp GitHub/Jira toàn hệ thống (Admin) */
export const useGetIntegrationStats = () => useQuery({
    queryKey: ANALYTICS_KEYS.integrationStats(),
    queryFn: getIntegrationStats,
});

/** Xu hướng commit (Admin + Lecturer) */
export const useGetCommitTrends = (days = 7) => useQuery({
    queryKey: ANALYTICS_KEYS.commitTrends(days),
    queryFn: () => getCommitTrends(days),
});

/** Heatmap toàn hệ thống (Admin) */
export const useGetSystemHeatmap = (days = 90) => useQuery({
    queryKey: ANALYTICS_KEYS.heatmap(days),
    queryFn: () => getSystemHeatmap(days),
});

/** Radar chart so sánh nhóm (Lecturer + Admin) */
export const useGetGroupRadarMetrics = (courseId) => useQuery({
    queryKey: ANALYTICS_KEYS.radar(courseId),
    queryFn: () => getGroupRadarMetrics(courseId),
    enabled: !!courseId,
});

/** Bảng xếp hạng nhóm (Admin) */
export const useGetTeamRankings = (limit = 4) => useQuery({
    queryKey: ANALYTICS_KEYS.teamRankings(limit),
    queryFn: () => getTeamRankings(limit),
});

/** Nhóm ít hoạt động (Admin) */
export const useGetInactiveTeams = () => useQuery({
    queryKey: ANALYTICS_KEYS.inactiveTeams(),
    queryFn: getInactiveTeams,
});

/** Chi tiết hoạt động nhóm (Admin) */
export const useGetTeamActivities = () => useQuery({
    queryKey: ANALYTICS_KEYS.teamActivities(),
    queryFn: getTeamActivities,
});

/** Activity log hệ thống (Admin + Lecturer) */
export const useGetActivityLog = (limit = 10) => useQuery({
    queryKey: ANALYTICS_KEYS.activityLog(limit),
    queryFn: () => getActivityLog(limit),
});

/** Stats lớp dạy của GV đang đăng nhập */
export const useGetLecturerCoursesStats = () => useQuery({
    queryKey: ANALYTICS_KEYS.lecturerCourses(),
    queryFn: getLecturerCoursesStats,
});

/** Activity logs của GV đang đăng nhập */
export const useGetLecturerActivityLogs = (limit = 10) => useQuery({
    queryKey: ANALYTICS_KEYS.lecturerActivityLogs(limit),
    queryFn: () => getLecturerActivityLogs(limit),
});

/** Gán GV hàng loạt (Admin mutation) */
export const useBulkAssign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bulkAssign,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
    });
};
