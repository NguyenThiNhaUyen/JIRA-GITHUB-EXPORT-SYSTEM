import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSemesters, createSemester, updateSemester, getSubjects, createSubject, updateSubject } from "../api/systemApi.js";

export const SYSTEM_KEYS = {
    all: ["system"],
    semesters: () => [...SYSTEM_KEYS.all, "semesters"],
    subjects: () => [...SYSTEM_KEYS.all, "subjects"],
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
