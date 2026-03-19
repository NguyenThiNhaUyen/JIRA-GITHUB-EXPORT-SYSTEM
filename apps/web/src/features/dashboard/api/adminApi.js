import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * NOTE: /api/admin/stats KHÔNG TỒN TẠI trong BE.
 * AdminController chỉ có: POST /api/admin/bulk-assign
 * Để lấy thống kê tổng quan Admin, dùng:
 *   → analyticsApi.getAnalyticsStats()  → GET /api/analytics/stats
 *   → analyticsApi.getIntegrationStats() → GET /api/analytics/integration-stats
 *   → analyticsApi.getTeamRankings()    → GET /api/analytics/team-rankings
 *   → analyticsApi.getInactiveTeams()   → GET /api/analytics/inactive-teams
 *   → analyticsApi.getTeamActivities()  → GET /api/analytics/team-activities
 * Tất cả đã được define trong useDashboard.js (useAdminStats, useIntegrationStats,...)
 */

/**
 * POST /api/admin/bulk-assign
 * Gán giảng viên hàng loạt vào các lớp
 * body: { assignments: [ { courseId, lecturerId } ] }
 * BE: AdminController → BulkAssign(request)
 */
export async function bulkAssignLecturers(assignments) {
    const res = await client.post("/admin/bulk-assign", { assignments });
    return unwrap(res);
}
