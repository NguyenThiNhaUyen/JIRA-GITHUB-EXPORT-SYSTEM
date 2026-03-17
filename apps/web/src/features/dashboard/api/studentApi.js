import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/analytics/student/stats
 */
export async function getStudentStats() {
    const res = await client.get("/student/me/stats");
    return unwrap(res);
}

/**
 * GET /api/analytics/student/deadlines
 */
export async function getStudentDeadlines() {
    const res = await client.get("/student/me/deadlines");
    return unwrap(res);
}

/**
 * GET /api/student/me/heatmap (BE v2.1)
 */
export async function getStudentHeatmap(days = 35) {
    const res = await client.get("/student/me/heatmap", { params: { days } });
    return unwrap(res);
}

/**
 * GET /api/student/me/commit-activity?days=7 (BE v2.1)
 */
export async function getStudentCommitActivity(days = 7) {
    const res = await client.get("/student/me/commit-activity", { params: { days } });
    return unwrap(res);
}

/**
 * GET /api/student/me/projects (BE v2.1)
 */
export async function getStudentProjects(params = {}) {
    const res = await client.get("/student/me/projects", { params });
    return unwrap(res);
}

