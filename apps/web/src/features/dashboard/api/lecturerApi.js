import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/lecturers/me/workload
 */
export async function getMyWorkload() {
    const res = await client.get("/lecturers/me/workload");
    return unwrap(res);
}

/**
 * GET /api/lecturers/me/courses
 */
export async function getMyCourses() {
    const res = await client.get("/lecturers/me/courses");
    return unwrap(res);
}

/**
 * POST /api/alerts/send
 */
export async function sendAlert(body) {
    const res = await client.post("/alerts/send", body);
    return unwrap(res);
}

/**
 * GET /api/analytics/lecturer/activity-logs
 */
export async function getLecturerActivityLogs(limit = 5) {
    const res = await client.get("/analytics/lecturer/activity-logs", { params: { limit } });
    return unwrap(res);
}






