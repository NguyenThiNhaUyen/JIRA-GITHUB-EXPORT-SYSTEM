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
 * PUT /api/alerts/:id/resolve  (BE v2.2 cũng nhận PATCH, đổi sang PUT chuẩn REST)
 * [LECTURER, ADMIN only]
 * @param {number|string} id
 */
export async function resolveAlert(id) {
    const res = await client.put(`/alerts/${id}/resolve`);
    return unwrap(res);
}

/**
 * POST /api/alerts/send
 * Frontend có thể cho Giảng Viên gửi cảnh báo thủ công.
 * Payload: { "projectId": 12, "message": "...", "severity": "HIGH" }
 */
export async function sendAlert(payload) {
    const res = await client.post("/alerts/send", payload);
    return unwrap(res);
}
