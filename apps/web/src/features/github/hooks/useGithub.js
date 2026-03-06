import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectCommits, syncGithubCommits, getCommitsStats } from "../api/githubApi.js";

export const GITHUB_KEYS = {
    all: ["github"],
    commits: (projectId) => [...GITHUB_KEYS.all, "commits", projectId],
    stats: (courseId) => [...GITHUB_KEYS.all, "stats", courseId],
};

export const useGetProjectCommits = (projectId, limit) => {
    return useQuery({
        queryKey: GITHUB_KEYS.commits(projectId),
        queryFn: () => getProjectCommits(projectId, limit),
        enabled: !!projectId,
    });
};

export const useGetCommitsStats = (courseId, startDate, endDate) => {
    return useQuery({
        queryKey: [...GITHUB_KEYS.stats(courseId), { startDate, endDate }],
        queryFn: () => getCommitsStats(courseId, startDate, endDate),
        enabled: !!courseId,
    });
};

export const useSyncCommits = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => syncGithubCommits(projectId),
        onSuccess: (_, projectId) => {
            // Reload danh sách commits của project sau khi sync
            queryClient.invalidateQueries({ queryKey: GITHUB_KEYS.commits(projectId) });

            // Bonus: Reload lại query của module Project để cập nhật badge thời gian sync mới nhất
            // => Khả năng Inter-module caching vĩ đại của React Query!
            queryClient.invalidateQueries({ queryKey: ["projects", "detail", projectId] });
        },
    });
};
