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

/** Láº¥y danh sĂ¡ch SRS cho giáº£ng viĂªn (load táº¥t cáº£ hoáº·c theo params) */
export const useSrsReports = (params = {}) => {
    return useQuery({
        queryKey: SRS_KEYS.reports(params),
        queryFn: () => getProjectSrs(params),
    });
};

/** Láº¥y danh sĂ¡ch SRS cá»§a má»™t project */
export const useGetProjectSrs = (projectId) => {
    return useQuery({
        queryKey: SRS_KEYS.list(projectId),
        queryFn: () => getProjectSrs(projectId),
        enabled: !!projectId,
    });
};

/**
 * Ná»™p SRS má»›i â€” gá»­i file tháº­t qua FormData (multipart/form-data)
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
 * Cáº­p nháº­t status SRS (Giáº£ng viĂªn approve/reject)
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
 * ÄĂ¡nh giĂ¡ SRS (Giáº£ng viĂªn)
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
 * Gá»­i feedback cho SRS (Giáº£ng viĂªn)
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
 * XĂ³a SRS Report
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

