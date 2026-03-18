import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapAnalyticsStats, mapHeatmapData, mapRadarData } from "./mappers/analyticsMapper.js";

/**
 * GET /api/analytics/stats
 * Thá»‘ng kĂª tá»•ng quan cho Admin Dashboard
 */
export async function getAnalyticsStats() {
    const res = await client.get("/analytics/stats");
    return mapAnalyticsStats(unwrap(res));
}

/**
 * GET /api/analytics/integration-stats
 * Thá»‘ng kĂª tĂ­ch há»£p GitHub/Jira
 */
export async function getIntegrationStats() {
    const res = await client.get("/analytics/integration-stats");
    return unwrap(res);
}

/**
 * GET /api/analytics/commit-trends
 * Xu hÆ°á»›ng commit theo ngĂ y (ADMIN, LECTURER)
 */
export async function getCommitTrends(days = 7) {
    const res = await client.get("/analytics/commit-trends", { params: { days } });
    return unwrap(res);
}

/**
 * GET /api/analytics/heatmap
 * Dá»¯ liá»‡u báº£n Ä‘á»“ nhiá»‡t Commit (ADMIN, LECTURER)
 */
export async function getAnalyticsHeatmap(days = 90) {
    const res = await client.get("/analytics/heatmap", { params: { days } });
    return mapHeatmapData(unwrap(res));
}

/**
 * GET /api/analytics/radar
 * Biá»ƒu Ä‘á»“ Radar so sĂ¡nh cĂ¡c nhĂ³m (ADMIN, LECTURER)
 */
export async function getAnalyticsRadar(courseId) {
    const res = await client.get("/analytics/radar", { params: { courseId } });
    return mapRadarData(unwrap(res));
}

/**
 * GET /api/analytics/team-rankings
 * Xáº¿p háº¡ng Top Teams theo commits
 */
export async function getTeamRankings(limit = 4) {
    const res = await client.get("/analytics/team-rankings", { params: { limit } });
    return unwrap(res);
}

/**
 * GET /api/analytics/inactive-teams
 * Danh sĂ¡ch nhĂ³m khĂ´ng hoáº¡t Ä‘á»™ng
 */
export async function getInactiveTeams() {
    const res = await client.get("/analytics/inactive-teams");
    return unwrap(res);
}

/**
 * GET /api/analytics/team-activities
 * Hoáº¡t Ä‘á»™ng cĂ¡c nhĂ³m
 */
export async function getTeamActivities() {
    const res = await client.get("/analytics/team-activities");
    return unwrap(res);
}

/**
 * GET /api/analytics/activity-log
 * Lá»‹ch sá»­ hoáº¡t Ä‘á»™ng há»‡ thá»‘ng (ADMIN, LECTURER)
 */
export async function getActivityLog(limit = 10) {
    const res = await client.get("/analytics/activity-log", { params: { limit } });
    return unwrap(res);
}

/**
 * GET /api/analytics/lecturer/courses
 * Danh sĂ¡ch lá»›p cá»§a giáº£ng viĂªn (LECTURER, ADMIN)
 */
export async function getLecturerCourses() {
    const res = await client.get("/analytics/lecturer/courses");
    return unwrap(res);
}

