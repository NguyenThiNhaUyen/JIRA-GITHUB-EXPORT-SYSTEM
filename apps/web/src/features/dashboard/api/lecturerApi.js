import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/lecturers/{id}/workload
 */
export async function getLecturerWorkload(lecturerId) {
    const res = await client.get(`/lecturers/${lecturerId}/workload`);
    return unwrap(res);
}

/**
 * GET /api/analytics/lecturer/activity-logs
 */
export async function getLecturerActivityLogs(limit = 5) {
    const res = await client.get("/analytics/lecturer/activity-logs", { params: { limit } });
    return unwrap(res);
}
