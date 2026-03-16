import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/courses/{courseId}/groups/{groupId}
 * Lấy thông tin chi tiết nhóm theo ID.
 * Nếu BE không có endpoint riêng cho group, dùng project endpoint thay thế.
 */
export async function getGroupById(groupId) {
    // Groups are nested under projects in our BE → GET /api/projects/:id
    const res = await client.get(`/projects/${groupId}`);
    return unwrap(res);
}

/**
 * POST /api/projects/{projectId}/github/approve
 * Approve liên kết GitHub cho nhóm
 */
export async function approveGroupLink(groupId, linkType, lecturerId) {
    const endpoint = linkType === "github"
        ? `/projects/${groupId}/github/approve`
        : `/projects/${groupId}/jira/approve`;
    const res = await client.post(endpoint, { lecturerId });
    return unwrap(res);
}

/**
 * POST /api/projects/{projectId}/github/reject
 * Reject liên kết GitHub/Jira cho nhóm
 */
export async function rejectGroupLink(groupId, linkType, lecturerId) {
    const endpoint = linkType === "github"
        ? `/projects/${groupId}/github/reject`
        : `/projects/${groupId}/jira/reject`;
    const res = await client.post(endpoint, { lecturerId });
    return unwrap(res);
}

/**
 * PATCH /api/projects/{projectId}/members/{studentId}/score
 * Cập nhật điểm sinh viên trong nhóm (nếu BE hỗ trợ)
 */
export async function updateStudentScore(groupId, studentId, score) {
    const res = await client.patch(`/projects/${groupId}/members/${studentId}/score`, { score });
    return unwrap(res);
}
