import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

export async function getProjectCommits(projectId, limit = 50) {
    const res = await client.get(`/projects/${projectId}/commits`, { params: { pageSize: limit } });
    return unwrap(res);
}

export async function syncGithubCommits(projectId) {
    const res = await client.post(`/projects/${projectId}/sync-commits`);
    return unwrap(res);
}

export async function getCommitsStats(courseId, startDate, endDate) {
    const res = await client.get(`/analytics/commits-stats`, { params: { courseId, startDate, endDate } });
    return unwrap(res);
}
