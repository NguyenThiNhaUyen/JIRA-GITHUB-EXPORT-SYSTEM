import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as notificationApi from "../api/notificationApi.js";

export const NOTIFICATION_KEYS = {
    all: ["notifications"],
    list: (params) => [...NOTIFICATION_KEYS.all, "list", params],
};

export function useGetNotifications(params = {}) {
    return useQuery({
        queryKey: NOTIFICATION_KEYS.list(params),
        queryFn: () => notificationApi.getNotifications(params),
    });
}

export function useMarkAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => notificationApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
        },
    });
}






