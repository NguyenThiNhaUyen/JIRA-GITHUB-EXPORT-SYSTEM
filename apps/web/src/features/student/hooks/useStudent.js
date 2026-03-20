import { useQuery } from "@tanstack/react-query";
import {
    getMyStats, getMyCourses, getMyProjects,
    getMyCommits, getMyTasks, getMyGrades,
    getMyWarnings, getMyHeatmap, getMyCommitActivity,
    getMyDeadlines, getMyInvitations
} from "../api/studentApi.js";
import {
    getStudentDashboardStats, getStudentDeadlines, getStudentCommitActivity
} from "../api/analyticsStudentApi.js";

export const STUDENT_KEYS = {
    all: ["student"],
    stats: () => [...STUDENT_KEYS.all, "stats"],
    dashboardStats: () => [...STUDENT_KEYS.all, "dashboard-stats"],
    courses: (params) => [...STUDENT_KEYS.all, "courses", params],
    projects: (params) => [...STUDENT_KEYS.all, "projects", params],
    commits: (params) => [...STUDENT_KEYS.all, "commits", params],
    tasks: (params) => [...STUDENT_KEYS.all, "tasks", params],
    grades: (params) => [...STUDENT_KEYS.all, "grades", params],
    warnings: () => [...STUDENT_KEYS.all, "warnings"],
    heatmap: (days) => [...STUDENT_KEYS.all, "heatmap", days],
    commitActivity: (days) => [...STUDENT_KEYS.all, "commit-activity", days],
    deadlines: () => [...STUDENT_KEYS.all, "deadlines"],
    invitations: () => [...STUDENT_KEYS.all, "invitations"],
};

/** Thống kê cá nhân */
export const useGetMyStats = () => useQuery({
    queryKey: STUDENT_KEYS.stats(),
    queryFn: getMyStats,
});

/** Dashboard stats (analytics endpoint — richer) */
export const useGetStudentDashboardStats = () => useQuery({
    queryKey: STUDENT_KEYS.dashboardStats(),
    queryFn: getStudentDashboardStats,
});

/** Lớp học */
export const useGetMyCourses = (params = {}) => useQuery({
    queryKey: STUDENT_KEYS.courses(params),
    queryFn: () => getMyCourses(params),
});

/** Nhóm dự án */
export const useGetMyProjects = (params = {}) => useQuery({
    queryKey: STUDENT_KEYS.projects(params),
    queryFn: () => getMyProjects(params),
});

/** Commits */
export const useGetMyCommits = (params = {}) => useQuery({
    queryKey: STUDENT_KEYS.commits(params),
    queryFn: () => getMyCommits(params),
});

/** Tasks Jira */
export const useGetMyTasks = (params = {}) => useQuery({
    queryKey: STUDENT_KEYS.tasks(params),
    queryFn: () => getMyTasks(params),
});

/** Điểm số */
export const useGetMyGrades = (params = {}) => useQuery({
    queryKey: STUDENT_KEYS.grades(params),
    queryFn: () => getMyGrades(params),
});

/** Cảnh báo */
export const useGetMyWarnings = () => useQuery({
    queryKey: STUDENT_KEYS.warnings(),
    queryFn: getMyWarnings,
});

/** Heatmap */
export const useGetMyHeatmap = (days = 35) => useQuery({
    queryKey: STUDENT_KEYS.heatmap(days),
    queryFn: () => getMyHeatmap(days),
});

/** Commit activity weekly */
export const useGetMyCommitActivity = (days = 7) => useQuery({
    queryKey: STUDENT_KEYS.commitActivity(days),
    queryFn: () => getMyCommitActivity(days),
});

/** Deadlines — kết hợp StudentController + AnalyticsController */
export const useGetMyDeadlines = () => useQuery({
    queryKey: STUDENT_KEYS.deadlines(),
    queryFn: async () => {
        try {
            return await getStudentDeadlines(); // Analytics endpoint (richer)
        } catch {
            return await getMyDeadlines(); // Fallback: StudentController
        }
    },
});

/** Lời mời nhóm */
export const useGetMyInvitations = (params = {}) => useQuery({
    queryKey: STUDENT_KEYS.invitations(),
    queryFn: () => getMyInvitations(params),
});
