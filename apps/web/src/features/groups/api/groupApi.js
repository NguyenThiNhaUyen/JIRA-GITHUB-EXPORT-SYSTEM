import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/courses/{courseId}/groups/{groupId}
 * Láº¥y thĂ´ng tin chi tiáº¿t nhĂ³m theo ID.
 * Náº¿u BE khĂ´ng cĂ³ endpoint riĂªng cho group, dĂ¹ng project endpoint thay tháº¿.
 */
export async function getGroupById(groupId) {
    const res = await client.get(`/projects/${groupId}`);
    return unwrap(res);
}

/**
 * POST /api/projects/{projectId}/github/approve
 * Approve liĂªn káº¿t GitHub cho nhĂ³m
 */
export async function approveGroupLink(groupId, linkType) {
    const res = await client.post(`/projects/${groupId}/links/${linkType}/approve`);
    return unwrap(res);
}

/**
 * POST /api/projects/{projectId}/github/reject
 * Reject liĂªn káº¿t GitHub/Jira cho nhĂ³m
 */
export async function rejectGroupLink(groupId, linkType) {
    const res = await client.post(`/projects/${groupId}/links/${linkType}/reject`);
    return unwrap(res);
}

/**
 * PATCH /api/projects/{projectId}/members/{studentId}/score
 * Cáº­p nháº­t Ä‘iá»ƒm sinh viĂªn trong nhĂ³m (náº¿u BE há»— trá»£)
 */
export async function updateStudentScore(groupId, studentId, score) {
    const res = await client.put(`/projects/${groupId}/students/${studentId}/score`, { score });
    return unwrap(res);
}
