import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getProjectSrs,
    submitSrsReport,
    updateSrsStatus,
    reviewSrs,
    provideSrsFeedback,
    deleteSrsReport,
} from "../api/srsApi.js";

export const SRS_KEYS = {
    all: ["srs"],
    list: (projectId) => [...SRS_KEYS.all, "list", projectId],
    reports: (params) => [...SRS_KEYS.all, "reports", params],
};

/** Lấy danh sách SRS cho giảng viên (load tất cả hoặc theo params) */
export const useSrsReports = (params = {}) => {
    return useQuery({
        queryKey: SRS_KEYS.reports(params),
        queryFn: () => getProjectSrs(params),
    });
};

/** Lấy danh sách SRS của một project */
export const useGetProjectSrs = (projectId) => {
    return useQuery({
        queryKey: SRS_KEYS.list(projectId),
        queryFn: () => getProjectSrs(projectId),
        enabled: !!projectId,
    });
};

/**
 * Nộp SRS mới — gửi file thật qua FormData (multipart/form-data)
 */
export const useSubmitSrs = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, file }) =>
            submitSrsReport(projectId, { file }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: SRS_KEYS.list(variables.projectId) });
            queryClient.invalidateQueries({ queryKey: SRS_KEYS.all });
        },
    });
};

/**
 * Cập nhật status SRS (Giảng viên approve/reject)
 */
export const useUpdateSrsStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, newStatus, feedback }) =>
            updateSrsStatus(reportId, newStatus, feedback),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SRS_KEYS.all });
        },
    });
};

/**
 * Đánh giá SRS (Giảng viên)
 */
export const useReviewSrs = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, status, feedback, score, metadata }) =>
            reviewSrs(reportId, { status, feedback, score, metadata }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SRS_KEYS.all });
        },
    });
};

/**
 * Gửi feedback cho SRS (Giảng viên)
 */
export const useProvideSrsFeedback = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, feedback }) => provideSrsFeedback(reportId, feedback),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SRS_KEYS.all });
        },
    });
};

/**
 * Xóa SRS Report
 */
export const useDeleteSrs = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId }) => deleteSrsReport(reportId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SRS_KEYS.all });
        },
    });
};






