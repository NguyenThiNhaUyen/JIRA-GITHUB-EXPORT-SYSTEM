import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/courses/{courseId}/groups/{groupId}
 * Lấy thông tin chi tiết nhóm theo ID.
 * Nếu BE không có endpoint riêng cho group, dùng project endpoint thay thế.
 */
export async function getGroupById(groupId) {
    const res = await client.get(`/projects/${groupId}`);
    return unwrap(res);
}

/**
 * POST /api/projects/{projectId}/integrations/approve
 * Approve liên kết GitHub/Jira cho nhóm (Lecturer/Admin)
 * BE: ProjectsController → ApproveIntegration(projectId)
 */
export async function approveGroupLink(groupId) {
    const res = await client.post(`/projects/${groupId}/integrations/approve`);
    return unwrap(res);
}

/**
 * POST /api/projects/{projectId}/integrations/reject
 * Reject liên kết GitHub/Jira cho nhóm (Lecturer/Admin)
 * BE: ProjectsController → RejectIntegration(projectId, { reason })
 */
export async function rejectGroupLink(groupId, reason = "") {
    const res = await client.post(`/projects/${groupId}/integrations/reject`, { reason });
    return unwrap(res);
}

/**
 * PATCH /api/projects/{projectId}/members/{memberId}/contribution
 * Cập nhật contribution score của thành viên trong nhóm (Lecturer/Admin)
 * BE: ProjectsController → UpdateContribution(projectId, memberId, { contributionScore })
 */
export async function updateStudentScore(groupId, studentId, score) {
    const res = await client.patch(`/projects/${groupId}/members/${studentId}/contribution`, {
        contributionScore: score
    });
    return unwrap(res);
}
