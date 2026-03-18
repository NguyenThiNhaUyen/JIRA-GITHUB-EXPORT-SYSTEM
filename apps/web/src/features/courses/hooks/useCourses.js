import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    assignLecturer,
    enrollStudents,
    removeLecturer,
    unenrollStudent,
    getEnrolledStudents,
    importStudents
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
export const useRemoveLecturer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ courseId, lecturerUserId }) => removeLecturer(courseId, lecturerUserId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
        },
    });
};

export const useUnenrollStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ courseId, studentUserId }) => unenrollStudent(courseId, studentUserId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
        },
    });
};

export const useGetEnrolledStudents = (courseId, params) => {
    return useQuery({
        queryKey: [...COURSE_KEYS.detail(courseId), 'students', params],
        queryFn: () => getEnrolledStudents(courseId, params),
        enabled: !!courseId,
    });
};

export const useImportStudents = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ courseId, formData }) => importStudents(courseId, formData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
        },
    });
};






