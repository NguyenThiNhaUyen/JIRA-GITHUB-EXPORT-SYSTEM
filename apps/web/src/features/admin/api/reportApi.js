import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * Tạo báo cáo Commit Statistics
 */
export async function generateCommitStats(courseId, format = "PDF") {
    const res = await client.post(`/reports/commit-statistics`, null, {
        params: { courseId, format }
    });
    return unwrap(res);
}

/**
 * Tạo báo cáo Team Roster
 */
export async function generateTeamRoster(projectId, format = "PDF") {
    const res = await client.post(`/reports/team-roster`, null, {
        params: { projectId, format }
    });
    return unwrap(res);
}

/**
 * Tạo báo cáo Activity Summary
 */
export async function generateActivitySummary(projectId, startDate, endDate, format = "PDF") {
    const res = await client.post(`/reports/activity-summary`, null, {
        params: { projectId, startDate, endDate, format }
    });
    return unwrap(res);
}

/**
 * Tạo báo cáo SRS
 */
export async function generateSrs(projectId, format = "PDF") {
    const res = await client.post(`/reports/srs`, null, {
        params: { projectId, format }
    });
    return unwrap(res);
}

/**
 * Láy link tải báo cáo
 */
export async function getReportDownloadLink(reportId) {
    const res = await client.get(`/reports/${reportId}/download-link`);
    return unwrap(res);
}

/**
 * Lấy danh sách báo cáo của tôi
 */
export async function getMyReports() {
    const res = await client.get(`/reports`);
    return unwrap(res);
}
