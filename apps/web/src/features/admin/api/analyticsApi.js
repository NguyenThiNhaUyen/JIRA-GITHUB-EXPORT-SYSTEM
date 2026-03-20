import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * analyticsApi.js — Admin & Lecturer analytics endpoints
 * Route prefix: /api/analytics/*
 */

/** GET /api/analytics/integration-stats — Thống kê tích hợp GitHub/Jira */
export async function getIntegrationStats() {
    const res = await client.get("/analytics/integration-stats");
    return unwrap(res);
}

/** GET /api/analytics/commit-trends?days=7 — Xu hướng commit */
export async function getCommitTrends(days = 7) {
    const res = await client.get("/analytics/commit-trends", { params: { days } });
    return unwrap(res);
}

/** GET /api/analytics/heatmap?days=90 — Heatmap commit toàn hệ thống */
export async function getSystemHeatmap(days = 90) {
    const res = await client.get("/analytics/heatmap", { params: { days } });
    return unwrap(res);
}

/** GET /api/analytics/radar?courseId=1 — Radar chart so sánh nhóm */
export async function getGroupRadarMetrics(courseId) {
    const res = await client.get("/analytics/radar", { params: { courseId } });
    return unwrap(res);
}

/** GET /api/analytics/team-rankings?limit=4 — Bảng xếp hạng nhóm */
export async function getTeamRankings(limit = 4) {
    const res = await client.get("/analytics/team-rankings", { params: { limit } });
    return unwrap(res);
}

/** GET /api/analytics/inactive-teams — Nhóm ít hoạt động */
export async function getInactiveTeams() {
    const res = await client.get("/analytics/inactive-teams");
    return unwrap(res);
}

/** GET /api/analytics/team-activities — Chi tiết hoạt động nhóm */
export async function getTeamActivities() {
    const res = await client.get("/analytics/team-activities");
    return unwrap(res);
}

/** GET /api/analytics/activity-log?limit=10 — Activity log (Admin Dashboard) */
export async function getActivityLog(limit = 10) {
    const res = await client.get("/analytics/activity-log", { params: { limit } });
    return unwrap(res);
}

/** GET /api/analytics/lecturer/courses — GV: stats lớp dạy */
export async function getLecturerCoursesStats() {
    const res = await client.get("/analytics/lecturer/courses");
    return unwrap(res);
}

/** GET /api/analytics/lecturer/activity-logs?limit=10 — GV: hoạt động gần đây */
export async function getLecturerActivityLogs(limit = 10) {
    const res = await client.get("/analytics/lecturer/activity-logs", { params: { limit } });
    return unwrap(res);
}

/** POST /api/admin/bulk-assign — Gán GV hàng loạt */
export async function bulkAssign(data) {
    const res = await client.post("/admin/bulk-assign", data);
    return unwrap(res);
}
