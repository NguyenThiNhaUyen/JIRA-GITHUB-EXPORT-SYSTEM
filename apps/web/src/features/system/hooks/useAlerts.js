import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlerts, resolveAlert } from "../api/alertApi.js";

export const ALERT_KEYS = {
    all: ["alerts"],
    list: (params) => [...ALERT_KEYS.all, { params }],
};

export const useGetAlerts = (params) => {
    return useQuery({
        queryKey: ALERT_KEYS.list(params),
        queryFn: () => getAlerts(params),
    });
};

export const useResolveAlert = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => resolveAlert(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ALERT_KEYS.all });
        },
    });
};
