import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * Lấy danh sách commits (Pagination)
 * BE khớp với: GET /api/projects/{projectId}/commits?page=1&pageSize={limit}
 */
export async function getProjectCommits(projectId, limit = 50) {
    // Đổi tham số 'limit' FE truyền vào sang 'pageSize' theo Rest BE chuẩn
    const res = await client.get(`/projects/${projectId}/commits`, {
        params: { page: 1, pageSize: limit }
    });
    return unwrap(res);
}

/**
 * Kích hoạt đồng bộ GitHub Commits từ backend
 * BE khớp với: POST /api/projects/{projectId}/sync-commits
 */
export async function syncGithubCommits(projectId) {
    const res = await client.post(`/projects/${projectId}/sync-commits`);
    return unwrap(res);
}

/**
 * Lấy log thống kê đóng góp commit (đã chuyển qua thư mục Analytics ở Backend)
 * BE khớp với: GET /api/analytics/courses/{courseId}/contributions
 */
export async function getCommitsStats(courseId, startDate, endDate) {
    // Backend Controller: AnalyticsController.GetCourseContributions
    const res = await client.get(`/analytics/courses/${courseId}/contributions`, {
        params: { startDate, endDate }
    });
    return unwrap(res);
}
