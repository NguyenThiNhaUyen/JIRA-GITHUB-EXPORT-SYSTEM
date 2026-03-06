import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    assignLecturer,
    enrollStudents
} from '../api/courseApi.js';

export const COURSE_KEYS = {
    all: ['courses'],
    lists: () => [...COURSE_KEYS.all, 'list'],
    list: (filters) => [...COURSE_KEYS.lists(), { filters }],
    details: () => [...COURSE_KEYS.all, 'detail'],
    detail: (id) => [...COURSE_KEYS.details(), id],
};

export const useGetCourses = (params) => {
    return useQuery({
        queryKey: COURSE_KEYS.list(params),
        queryFn: () => getCourses(params),
    });
};

export const useGetCourseById = (id) => {
    return useQuery({
        queryKey: COURSE_KEYS.detail(id),
        queryFn: () => getCourseById(id),
        enabled: !!id,
    });
};

export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body) => createCourse(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
        },
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }) => updateCourse(id, body),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(variables.id) });
        },
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteCourse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
        },
    });
};

export const useAssignLecturer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ courseId, lecturerUserId }) => assignLecturer(courseId, lecturerUserId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
        },
    });
};

export const useEnrollStudents = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ courseId, studentUserIds }) => enrollStudents(courseId, studentUserIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
        },
    });
};
