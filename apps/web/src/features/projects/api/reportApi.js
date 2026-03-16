import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

export async function generateSrsReport(projectId, format = "PDF") {
    const res = await client.post(`/reports/srs`, null, {
        params: { projectId, format }
    });
    return unwrap(res);
}

export async function getDownloadUrl(reportId) {
    const res = await client.get(`/reports/${reportId}/download-link`);
    return unwrap(res);
}

export async function generateCommitStatisticsReport(courseId, format = "PDF") {
    const res = await client.post(`/reports/commit-statistics`, null, {
        params: { courseId, format }
    });
    return unwrap(res);
}

export async function generateTeamRosterReport(projectId, format = "PDF") {
    const res = await client.post(`/reports/team-roster`, null, {
        params: { projectId, format }
    });
    return unwrap(res);
}

export async function generateActivitySummaryReport(projectId, startDate, endDate, format = "PDF") {
    const res = await client.post(`/reports/activity-summary`, null, {
        params: { projectId, startDate, endDate, format }
    });
    return unwrap(res);
}
