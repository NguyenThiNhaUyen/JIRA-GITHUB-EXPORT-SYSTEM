import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * analyticsStudentApi.js — Student analytics endpoints via AnalyticsController
 * Route prefix: /api/analytics/student/*
 */

/** GET /api/analytics/student/stats — Dashboard stats for student */
export async function getStudentDashboardStats() {
    const res = await client.get("/analytics/student/stats");
    return unwrap(res);
}

/** GET /api/analytics/student/deadlines — Deadlines from Jira */
export async function getStudentDeadlines() {
    const res = await client.get("/analytics/student/deadlines");
    return unwrap(res);
}

/** GET /api/analytics/student/me/commit-activity?days=7 */
export async function getStudentCommitActivity(days = 7) {
    const res = await client.get("/analytics/student/me/commit-activity", { params: { days } });
    return unwrap(res);
}
