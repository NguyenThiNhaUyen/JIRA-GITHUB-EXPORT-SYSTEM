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
            // Reload danh sĂ¡ch commits cá»§a project sau khi sync
            queryClient.invalidateQueries({ queryKey: GITHUB_KEYS.commits(projectId) });

            // Bonus: Reload láº¡i query cá»§a module Project Ä‘á»ƒ cáº­p nháº­t badge thá»i gian sync má»›i nháº¥t
            // => Kháº£ nÄƒng Inter-module caching vÄ© Ä‘áº¡i cá»§a React Query!
            queryClient.invalidateQueries({ queryKey: ["projects", "detail", projectId] });
        },
    });
};

