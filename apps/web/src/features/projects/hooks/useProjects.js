import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    linkIntegration,
    approveIntegration,
    rejectIntegration,
    getProjectMetrics
} from '../api/projectApi.js';


export const PROJECT_KEYS = {
    all: ['projects'],
    lists: () => [...PROJECT_KEYS.all, 'list'],
    list: (filters) => [...PROJECT_KEYS.lists(), { filters }],
    details: () => [...PROJECT_KEYS.all, 'detail'],
    detail: (id) => [...PROJECT_KEYS.details(), id],
    team: (projectId) => [...PROJECT_KEYS.detail(projectId), 'team'],
};

export const useGetProjects = (params) => {
    return useQuery({
        queryKey: PROJECT_KEYS.list(params),
        queryFn: () => getProjects(params),
    });
};

export const useGetProjectById = (id) => {
    return useQuery({
        queryKey: PROJECT_KEYS.detail(id),
        queryFn: () => getProjectById(id),
        enabled: !!id,
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body) => createProject(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
        },
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }) => updateProject(id, body),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(variables.id) });
        },
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
        },
    });
};

export const useAddTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, studentId, role, responsibility }) =>
            addTeamMember(projectId, studentId, role, responsibility),
        onSuccess: (_, variables) => {
            // Invalidate cả detail và lists để dashboard cập nhật số thành viên
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
        },
    });
};

export const useRemoveTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, studentId }) => removeTeamMember(projectId, studentId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(variables.projectId) });
        },
    });
};

export const useUpdateTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, studentId, updates }) => updateTeamMember(projectId, studentId, updates),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(variables.projectId) });
        },
    });
};
export const useLinkIntegration = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, body }) => linkIntegration(projectId, body),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
        },
    });
};

export const useGetProjectMetrics = (projectId) => {
    return useQuery({
        queryKey: [...PROJECT_KEYS.detail(projectId), 'metrics'],
        queryFn: () => getProjectMetrics(projectId),
        enabled: !!projectId,
        refetchInterval: 60000, // Tự reload sau mỗi 1 phút
    });
};

export const useApproveIntegration = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => approveIntegration(projectId),
        onSuccess: (_, projectId) => {
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
        },
    });
};

export const useRejectIntegration = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, reason }) => rejectIntegration(projectId, reason),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
        },
    });
};
