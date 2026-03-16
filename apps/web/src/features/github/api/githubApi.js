import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * Lấy lịch sử commit của repository mà project hiện tại đang sử dụng
 * GET /api/projects/:projectId/commits
 */
export async function getProjectCommits(projectId, page = 1, pageSize = 50) {
    const res = await client.get(`/projects/${projectId}/commits`, { params: { page, pageSize } });
    // Trả về JSON chứa list array
    return unwrap(res);
}

/**
 * Gọi backend đồng bộ commit hiện tại
 * POST /api/projects/:projectId/sync-commits
 */
export async function syncGithubCommits(projectId) {
    const res = await client.post(`/projects/${projectId}/sync-commits`);
    return unwrap(res);
}

/**
 * Lịch sử commit theo từng sinh viên của 1 project
 * GET /api/projects/:projectId/commit-history
 */
export async function getProjectCommitHistory(projectId) {
    const res = await client.get(`/projects/${projectId}/commit-history`);
    return unwrap(res);
}
