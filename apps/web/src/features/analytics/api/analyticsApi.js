import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/analytics/student/stats
 */
export async function getStudentDashboardStats() {
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
 * GET /api/analytics/student/me/commit-activity
 */
export async function getStudentCommitActivity(days = 7) {
    const res = await client.get("/analytics/student/me/commit-activity", { params: { days } });
    return unwrap(res);
}

/**
 * GET /api/analytics/lecturer/courses
 */
export async function getLecturerCoursesStats() {
    const res = await client.get("/analytics/lecturer/courses");
    return unwrap(res);
}

/**
 * GET /api/analytics/lecturer/activity-logs
 */
export async function getLecturerActivityLogs(limit = 10) {
    const res = await client.get("/analytics/lecturer/activity-logs", { params: { limit } });
    return unwrap(res);
}

/**
 * GET /api/analytics/radar?courseId={courseId}
 * Radar chart for group comparison
 */
export async function getGroupRadarMetrics(courseId) {
    const res = await client.get("/analytics/radar", { params: { courseId } });
    return unwrap(res);
}

/**
 * GET /api/analytics/courses/{courseId}/contributions
 */
export async function getCourseContributions(courseId) {
    if (!courseId) return null;
    const res = await client.get(`/analytics/courses/${courseId}/contributions`);
    return unwrap(res);
}

