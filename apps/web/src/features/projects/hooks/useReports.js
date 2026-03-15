import { useMutation } from "@tanstack/react-query";
import * as reportApi from "../api/reportApi.js";

export function useCreateSrsReport() {
    return useMutation({
        mutationFn: ({ projectId, format }) => reportApi.createSrsReport(projectId, format)
    });
}
