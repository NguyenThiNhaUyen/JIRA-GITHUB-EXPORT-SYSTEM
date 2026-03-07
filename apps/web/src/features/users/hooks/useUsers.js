import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, getStudentLinks, linkStudentAccounts, updateUserRole, updateUserStatus, resetUserPassword } from "../api/userApi.js";

export const USER_KEYS = {
    all: ["users"],
    lists: () => [...USER_KEYS.all, "list"],
    list: (role) => [...USER_KEYS.lists(), role],
    links: (studentId) => [...USER_KEYS.all, "links", studentId],
};

export const useGetUsers = (role) => useQuery({ queryKey: USER_KEYS.list(role), queryFn: () => getUsers(role) });

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createUser,
        onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: USER_KEYS.list(variables.role) }),
    });
};

export const useGetStudentLinks = (studentId) => useQuery({
    queryKey: USER_KEYS.links(studentId),
    queryFn: () => getStudentLinks(studentId),
    enabled: !!studentId,
});

export const useLinkStudentAccounts = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ studentId, courseId, githubUrl, jiraUrl }) => linkStudentAccounts(studentId, courseId, githubUrl, jiraUrl),
        onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: USER_KEYS.links(variables.studentId) }),
    });
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, role }) => updateUserRole(id, role),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_KEYS.all }),
    });
};

export const useUpdateUserStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, enabled }) => updateUserStatus(id, enabled),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_KEYS.all }),
    });
};

export const useResetUserPassword = () => {
    return useMutation({
        mutationFn: ({ id, newPassword }) => resetUserPassword(id, newPassword),
    });
};
