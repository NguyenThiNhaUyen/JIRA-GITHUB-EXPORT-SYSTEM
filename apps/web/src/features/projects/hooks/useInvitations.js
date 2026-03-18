import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

export const INVITATION_KEYS = {
    all: ["invitations"],
    myPending: () => [...INVITATION_KEYS.all, "my-pending"],
};

/** Láº¥y danh sĂ¡ch lá»i má»i nhĂ³m (STUDENT) */
export const useGetMyPendingInvitations = () => {
    return useQuery({
        queryKey: INVITATION_KEYS.myPending(),
        queryFn: async () => {
            const res = await client.get("/student/me/invitations");
            const data = unwrap(res);
            return data?.items || [];
        },
    });
};

/** Äá»“ng Ă½ lá»i má»i nhĂ³m */
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
            // Cáº§n invalidate luĂ´n projects/groups vĂ¬ Ä‘Ă£ vĂ o nhĂ³m má»›i
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
};

/** Tá»« chá»‘i/Decline lá»i má»i nhĂ³m */
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

/** Gá»­i lá»i má»i gia nháº­p nhĂ³m */
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

