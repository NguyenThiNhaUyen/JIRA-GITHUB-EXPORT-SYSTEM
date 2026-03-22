import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

export const INVITATION_KEYS = {
    all: ["invitations"],
    myPending: () => [...INVITATION_KEYS.all, "my-pending"],
};

/** Lấy danh sách lời mời nhóm (STUDENT) */
export const useGetMyPendingInvitations = (options = {}) => {
    return useQuery({
        queryKey: INVITATION_KEYS.myPending(),
        queryFn: async () => {
            try {
                const res = await client.get("/invitations/my-pending");
                const data = unwrap(res);
                return data?.items || [];
            } catch (err) {
                console.error("Failed to fetch invitations (possibly 500):", err);
                return []; // Silent fail for student dashboard
            }
        },
        ...options
    });
};

/** Đồng ý lời mời nhóm */
export const useAcceptInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invitationId) => {
            const res = await client.patch(`/invitations/${invitationId}/accept`);
            return unwrap(res);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVITATION_KEYS.all });
            // Cần invalidate luôn projects/groups vì đã vào nhóm mới
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
};

/** Từ chối lời mời nhóm */
export const useRejectInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invitationId) => {
            const res = await client.patch(`/invitations/${invitationId}/reject`);
            return unwrap(res);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVITATION_KEYS.all });
        },
    });
};
