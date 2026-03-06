import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectSrs, submitSrsReport, updateSrsStatus } from "../api/srsApi.js";

export const SRS_KEYS = {
    all: ["srs"],
    list: (projectId) => [...SRS_KEYS.all, "list", projectId],
};

export const useGetProjectSrs = (projectId) => {
    return useQuery({
        queryKey: SRS_KEYS.list(projectId),
        queryFn: () => getProjectSrs(projectId),
        enabled: !!projectId,
    });
};

export const useSubmitSrsReport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, studentId, version, fileObj }) => submitSrsReport(projectId, studentId, version, fileObj),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: SRS_KEYS.list(variables.projectId) });
        }
    });
};

export const useUpdateSrsStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reportId, newStatus }) => updateSrsStatus(reportId, newStatus),
        // Update srsCache
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SRS_KEYS.all });
        }
    });
}
