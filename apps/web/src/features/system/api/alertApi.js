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
