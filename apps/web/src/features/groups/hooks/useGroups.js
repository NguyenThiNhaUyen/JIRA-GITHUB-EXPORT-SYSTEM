import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroupById, approveGroupLink, rejectGroupLink, updateStudentScore } from "../api/groupApi.js";

export const GROUP_KEYS = {
    all: ["groups"],
    list: () => [...GROUP_KEYS.all, "list"],
    details: () => [...GROUP_KEYS.all, "detail"],
    detail: (id) => [...GROUP_KEYS.details(), id],
};

export const useGetGroupById = (id) => {
    return useQuery({
        queryKey: GROUP_KEYS.detail(id),
        queryFn: () => getGroupById(id),
        enabled: !!id,
    });
};

export const useApproveLink = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, linkType }) => approveGroupLink(groupId, linkType),
        onSuccess: (_, variables) => {
            // áº¢o thuáº­t náº±m Ä‘Ă¢y: Gá»i API OK -> XoĂ¡ Cache bĂ¡o React táº£i láº¡i giao diá»‡n NhĂ³m Ä‘Ă³ láº­p tá»©c
            queryClient.invalidateQueries({ queryKey: GROUP_KEYS.detail(variables.groupId) });
        },
    });
};

export const useRejectLink = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, linkType }) => rejectGroupLink(groupId, linkType),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: GROUP_KEYS.detail(variables.groupId) });
        },
    });
};

export const useUpdateStudentScore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, studentId, score }) => updateStudentScore(groupId, studentId, score),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: GROUP_KEYS.detail(variables.groupId) });
        },
    });
};

