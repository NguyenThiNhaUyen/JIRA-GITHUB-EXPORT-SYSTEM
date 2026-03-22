import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client.js";
import { unwrap } from "../api/unwrap.js";

export const NOTIFICATION_KEYS = {
    all: ["notifications"],
    list: (params) => [...NOTIFICATION_KEYS.all, { params }],
};

/* API FUNCTIONS */

/**
 * GET /api/notifications
 * @param {{ page?: number, pageSize?: number }} params
 */
export async function getNotifications(params = {}) {
    const res = await client.get("/notifications", { params });
    return unwrap(res);
}

/**
 * PATCH /api/notifications/:id/read
 */
export async function markAsRead(id) {
    const res = await client.patch(`/notifications/${id}/read`);
    return unwrap(res);
}

/* HOOKS */

export const useGetNotifications = (params) => {
    return useQuery({
        queryKey: NOTIFICATION_KEYS.list(params),
        queryFn: () => getNotifications(params),
        ...params
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
        },
    });
};
