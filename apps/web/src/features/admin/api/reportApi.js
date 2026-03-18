import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * Táº¡o bĂ¡o cĂ¡o Commit Statistics
 */
export async function generateCommitStats(courseId, format = "PDF") {
    const res = await client.post(`/reports/commit-statistics`, null, {
        params: { courseId, format }
    });
    return unwrap(res);
}

/**
 * Táº¡o bĂ¡o cĂ¡o Team Roster
 */
export async function generateTeamRoster({ projectId, courseId, format = "PDF" }) {
    const res = await client.post(`/reports/team-roster`, null, {
        params: { projectId, courseId, format }
    });
    return unwrap(res);
}

/**
 * Táº¡o bĂ¡o cĂ¡o Activity Summary
 */
export async function generateActivitySummary(projectId, startDate, endDate, format = "PDF") {
    const res = await client.post(`/reports/activity-summary`, null, {
        params: { projectId, startDate, endDate, format }
    });
    return unwrap(res);
}

/**
 * Táº¡o bĂ¡o cĂ¡o SRS
 */
export async function generateSrs({ projectId, courseId, format = "PDF" }) {
    const res = await client.post(`/reports/srs`, null, {
        params: { projectId, courseId, format }
    });
    return unwrap(res);
}

/**
 * Láº¥y link táº£i bĂ¡o cĂ¡o
 */
export async function getReportDownloadLink(reportId) {
    const res = await client.get(`/reports/${reportId}/download-link`);
    return unwrap(res);
}

/**
 * Láº¥y danh sĂ¡ch bĂ¡o cĂ¡o cá»§a tĂ´i
 */
export async function getMyReports() {
    const res = await client.get(`/reports`);
    return unwrap(res);
}

/**
 * LĂ¡y bĂ¡o cĂ¡o theo Project/Course vĂ  Type
 */
export async function getReports({ projectId, courseId, type, status, milestone, page = 1, pageSize = 50 }) {
    const res = await client.get(`/reports`, {
        params: { projectId, courseId, type, status, milestone, page, pageSize }
    });
    return unwrap(res);
}

/**
 * Cáº­p nháº­t tráº¡ng thĂ¡i bĂ¡o cĂ¡o
 */
export async function updateReportStatus(reportId, status) {
    const res = await client.put(`/reports/${reportId}/status`, { status });
    return unwrap(res);
}

