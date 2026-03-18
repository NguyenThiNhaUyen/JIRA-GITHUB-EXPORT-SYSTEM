import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

export const INVITATION_KEYS = {
    all: ["invitations"],
    myPending: () => [...INVITATION_KEYS.all, "my-pending"],
};

/** Lấy danh sách lời mời nhóm (STUDENT) */
export const useGetMyPendingInvitations = () => {
    return useQuery({
        queryKey: INVITATION_KEYS.myPending(),
        queryFn: async () => {
            const res = await client.get("/invitations/my-pending");
            const data = unwrap(res);
            return data?.items || [];
        },
    });
};

/** Đồng ý lời mời nhóm */
export const useAcceptInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invitationId) => {
            try {
                const res = await client.put(`/invitations/${invitationId}/accept`);
                return unwrap(res);
            } catch (e) {
                const res = await client.patch(`/invitations/${invitationId}/accept`);
                return unwrap(res);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVITATION_KEYS.all });
            // Cần invalidate luôn projects/groups vì đã vào nhóm mới
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
};

/** Từ chối/Decline lời mời nhóm */
export const useRejectInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invitationId) => {
            try {
                const res = await client.put(`/invitations/${invitationId}/decline`);
                return unwrap(res);
            } catch (e) {
                // Fallback to reject if decline fails or is handled differently in BE
                const res = await client.patch(`/invitations/${invitationId}/reject`);
                return unwrap(res);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVITATION_KEYS.all });
        },
    });
};

/** Gửi lời mời gia nhập nhóm */
export const useCreateInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ groupId, invitedStudentId }) => {
            const res = await client.post("/invitations", { groupId, invitedStudentId });
            return unwrap(res);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVITATION_KEYS.all });
        },
    });
};
