import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/alerts
 * BE automatically filters based on role of JWT
 */
export async function getAlerts(params = {}) {
    const res = await client.get("/alerts", { params });
    return unwrap(res);
}

/**
 * [LECTURER, ADMIN only]
 * Resolves an alert. Tries PUT (REST standard) then fallback to PATCH.
 */
export async function resolveAlert(id) {
    try {
        const res = await client.put(`/alerts/${id}/resolve`);
        return unwrap(res);
    } catch (e) {
        const res = await client.patch(`/alerts/${id}/resolve`);
        return unwrap(res);
    }
}

/**
 * POST /api/alerts/send
 * Frontend cĂ³ thá»ƒ cho Giáº£ng ViĂªn gá»­i cáº£nh bĂ¡o thá»§ cĂ´ng.
 */
export async function sendAlert(payload) {
    const res = await client.post("/alerts/send", payload);
    return unwrap(res);
}
