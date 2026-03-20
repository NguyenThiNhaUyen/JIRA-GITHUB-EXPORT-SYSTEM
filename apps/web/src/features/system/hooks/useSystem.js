import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSemesters, createSemester, updateSemester, deleteSemester, getSubjects, createSubject, updateSubject, deleteSubject as deleteSubjectApi, getDashboardStats } from "../api/systemApi.js";

export const SYSTEM_KEYS = {
    all: ["system"],
    semesters: () => [...SYSTEM_KEYS.all, "semesters"],
    subjects: () => [...SYSTEM_KEYS.all, "subjects"],
    stats: () => [...SYSTEM_KEYS.all, "stats"],
};

export const useGetSemesters = () => useQuery({ queryKey: SYSTEM_KEYS.semesters(), queryFn: getSemesters });
export const useGetSubjects = () => useQuery({ queryKey: SYSTEM_KEYS.subjects(), queryFn: getSubjects });

export const useCreateSemester = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createSemester,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.semesters() }),
    });
};

export const useUpdateSemester = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }) => updateSemester(id, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.semesters() }),
    });
};

export const useDeleteSemester = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSemester,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.semesters() }),
    });
};

export const useCreateSubject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createSubject,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.subjects() }),
    });
};

export const useUpdateSubject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updates }) => updateSubject(id, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.subjects() }),
    });
};

export const useDeleteSubject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSubjectApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.subjects() }),
    });
};

export const useGetDashboardStats = () => useQuery({
    queryKey: SYSTEM_KEYS.stats(),
    queryFn: getDashboardStats,
    retry: false,          // Không retry khi 404
    staleTime: 5 * 60 * 1000,  // 5 phút
    onError: () => null,   // Bỏ qua lỗi silently
});
