import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapNotificationList, mapNotification } from "./mappers/notificationMapper.js";

/**
 * GET /api/notifications
 */
export async function getNotifications(params = {}) {
    const res = await client.get("/notifications", { params });
    return mapNotificationList(unwrap(res));
}

/**
 * PATCH /api/notifications/{id}/read
 */
export async function markAsRead(id) {
    const res = await client.patch(`/notifications/${id}/read`);
    return unwrap(res);
}

