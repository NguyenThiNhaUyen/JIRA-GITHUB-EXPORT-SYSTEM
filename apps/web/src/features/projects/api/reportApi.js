import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * Trigger tạo báo cáo (Khởi tạo Job)
 * POST /api/reports/srs?projectId={id}&format=PDF
 */
export async function createSrsReport(projectId, format = "PDF") {
    const res = await client.post("/reports/srs", null, {
        params: { projectId, format }
    });
    return unwrap(res);
}

/**
 * Lấy Link Download
 * GET /api/reports/{reportId}/download-link
 */
export async function getReportDownloadLink(reportId) {
    const res = await client.get(`/reports/${reportId}/download-link`);
    return unwrap(res);
}
