import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapAnalyticsStats, mapHeatmapData, mapRadarData } from "./mappers/analyticsMapper.js";

/**
 * GET /api/analytics/stats
 * Thống kê tổng quan cho Admin Dashboard
 */
export async function getAnalyticsStats() {
    const res = await client.get("/analytics/stats");
    return mapAnalyticsStats(unwrap(res));
}

/**
 * GET /api/analytics/integration-stats
 * Thống kê tích hợp GitHub/Jira
 */
export async function getIntegrationStats() {
    const res = await client.get("/analytics/integration-stats");
    return unwrap(res);
}

/**
 * GET /api/analytics/commit-trends
 * Xu hướng commit theo ngày (ADMIN, LECTURER)
 */
export async function getCommitTrends(days = 7) {
    const res = await client.get("/analytics/commit-trends", { params: { days } });
    return unwrap(res);
}

/**
 * GET /api/analytics/heatmap
 * Dữ liệu bản đồ nhiệt Commit (ADMIN, LECTURER)
 */
export async function getAnalyticsHeatmap(days = 90) {
    const res = await client.get("/analytics/heatmap", { params: { days } });
    return mapHeatmapData(unwrap(res));
}

/**
 * GET /api/analytics/radar
 * Biểu đồ Radar so sánh các nhóm (ADMIN, LECTURER)
 */
export async function getAnalyticsRadar(courseId) {
    const res = await client.get("/analytics/radar", { params: { courseId } });
    return mapRadarData(unwrap(res));
}

/**
 * GET /api/analytics/team-rankings
 * Xếp hạng Top Teams theo commits
 */
export async function getTeamRankings(limit = 4) {
    const res = await client.get("/analytics/team-rankings", { params: { limit } });
    return unwrap(res);
}

/**
 * GET /api/analytics/inactive-teams
 * Danh sách nhóm không hoạt động
 */
export async function getInactiveTeams() {
    const res = await client.get("/analytics/inactive-teams");
    return unwrap(res);
}

/**
 * GET /api/analytics/team-activities
 * Hoạt động các nhóm
 */
export async function getTeamActivities() {
    const res = await client.get("/analytics/team-activities");
    return unwrap(res);
}

/**
 * GET /api/analytics/activity-log
 * Lịch sử hoạt động hệ thống (ADMIN, LECTURER)
 */
export async function getActivityLog(limit = 10) {
    const res = await client.get("/analytics/activity-log", { params: { limit } });
    return unwrap(res);
}

/**
 * GET /api/analytics/lecturer/courses
 * Danh sách lớp của giảng viên (LECTURER, ADMIN)
 */
export async function getLecturerCourses() {
    const res = await client.get("/analytics/lecturer/courses");
    return unwrap(res);
}






