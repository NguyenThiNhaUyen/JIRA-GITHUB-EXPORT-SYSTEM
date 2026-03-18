import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * Láº¥y lá»‹ch sá»­ commit cá»§a repository mĂ  project hiá»‡n táº¡i Ä‘ang sá»­ dá»¥ng
 * GET /api/projects/:projectId/commits
 */
export async function getProjectCommits(projectId, page = 1, pageSize = 50) {
    const res = await client.get(`/projects/${projectId}/commits`, { params: { page, pageSize } });
    return unwrap(res);
}

/**
 * Gá»i backend Ä‘á»“ng bá»™ commit hiá»‡n táº¡i
 * POST /api/projects/:projectId/sync-commits
 */
export async function syncGithubCommits(projectId) {
    const res = await client.post(`/projects/${projectId}/sync-commits`);
    return unwrap(res);
}

/**
 * Lá»‹ch sá»­ commit theo tá»«ng sinh viĂªn cá»§a 1 project
 * GET /api/projects/:projectId/commit-history
 */
export async function getProjectCommitHistory(projectId) {
    const res = await client.get(`/projects/${projectId}/commit-history`);
    return unwrap(res);
}

export async function getCommitsStats(courseId, startDate, endDate) {
    const res = await client.get(`/analytics/commits-stats`, { params: { courseId, startDate, endDate } });
    return unwrap(res);
}
