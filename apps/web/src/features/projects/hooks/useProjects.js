import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
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
    getProjectMetrics,
    getProjectCommitHistory,
    syncProjectCommits
} from '../api/projectApi.js';

export const PROJECT_KEYS = {
    all: ['projects'],
    lists: () => [...PROJECT_KEYS.all, 'list'],
    list: (filters) => [...PROJECT_KEYS.lists(), filters],
    details: () => [...PROJECT_KEYS.all, 'detail'],
    detail: (id) => [...PROJECT_KEYS.details(), id],
    team: (projectId) => [...PROJECT_KEYS.detail(projectId), 'team'],
};

export const useGetProjects = (params) => {
    return useQuery({
        queryKey: PROJECT_KEYS.list(params),
        queryFn: () => getProjects(params),

        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        refetchOnMount: false
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
            queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
    },
    });
};

export const useUpdateTeamMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, studentId, contributionScore }) =>
    updateTeamMember(projectId, studentId, contributionScore),
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
        refetchInterval: 60000, 
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

export const useProjectCommitHistory = (projectId) => {
    return useQuery({
        queryKey: [...PROJECT_KEYS.detail(projectId), 'commit-history'],
        queryFn: () => getProjectCommitHistory(projectId),
        enabled: !!projectId
    });
};

export const useSyncProjectCommits = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => syncProjectCommits(projectId),
        onSuccess: (_, projectId) => {
            queryClient.invalidateQueries({ queryKey: [...PROJECT_KEYS.detail(projectId), 'metrics'] });
            queryClient.invalidateQueries({ queryKey: [...PROJECT_KEYS.detail(projectId), 'commit-history'] });
        }
    });
};

export const useCourseCommitHistories = (projectIds) => {
    return useQueries({
        queries: (projectIds || []).map(id => ({
            queryKey: [...PROJECT_KEYS.detail(id), 'commit-history'],
            queryFn: () => getProjectCommitHistory(id),
            enabled: !!id,
        }))
    });
};
