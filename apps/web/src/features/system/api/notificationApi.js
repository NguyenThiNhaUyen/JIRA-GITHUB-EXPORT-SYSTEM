import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

export async function getMyNotifications(params = { page: 1, pageSize: 10 }) {
    const res = await client.get("/notifications", { params });
    return unwrap(res);
}

export async function markNotificationAsRead(id) {
    const res = await client.patch(`/notifications/${id}/read`);
    return unwrap(res);
}
