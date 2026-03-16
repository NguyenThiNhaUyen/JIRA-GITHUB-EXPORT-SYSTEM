import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/analytics/student/stats
 */
export async function getStudentStats() {
    const res = await client.get("/analytics/student/stats");
    return unwrap(res);
}

/**
 * GET /api/analytics/student/deadlines
 */
export async function getStudentDeadlines() {
    const res = await client.get("/analytics/student/deadlines");
    return unwrap(res);
}

/**
 * GET /api/analytics/heatmap?days=90 (Dùng chung endpoint với Admin/Lecturer)
 */
export async function getStudentHeatmap(days = 35) {
    const res = await client.get("/analytics/heatmap", { params: { days } });
    return unwrap(res);
}

/**
 * GET /api/analytics/student/me/commit-activity?days=7 (BE v2.2)
 */
export async function getStudentCommitActivity(days = 7) {
    const res = await client.get("/analytics/student/me/commit-activity", { params: { days } });
    return unwrap(res);
}

