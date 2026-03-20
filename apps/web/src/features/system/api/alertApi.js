import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/alerts
 * BE automatically filters based on role of JWT:
 *   ADMIN    -> All alerts
 *   LECTURER -> Alerts for projects in their courses
 *   STUDENT  -> Alerts for their own projects
 *
 * @param {{ page?: number, pageSize?: number }} params
 * @returns {Promise<PagedResponse<Alert>>}
 */
export async function getAlerts(params = {}) {
    const res = await client.get("/alerts", { params });
    return unwrap(res);
}

/**
 * PATCH /api/alerts/:id/resolve
 * [LECTURER, ADMIN only]
 * @param {number|string} id
 */
export async function resolveAlert(id) {
    const res = await client.patch(`/alerts/${id}/resolve`);
    return unwrap(res);
}

/**
 * POST /api/alerts/send
 * Gửi alert thủ công (Lecturer → nhóm cụ thể)
 * Body: { projectId, message, severity: "LOW"|"MEDIUM"|"HIGH" }
 */
export async function sendAlert({ projectId, message, severity = "MEDIUM" }) {
    const res = await client.post("/alerts/send", { projectId, message, severity });
    return unwrap(res);
}

/**
 * POST /api/srs/remind-overdue
 * Nhắc nhở nộp SRS quá hạn (Lecturer/Admin)
 */
export async function remindOverdueSrs() {
    const res = await client.post("/srs/remind-overdue");
    return unwrap(res);
}
