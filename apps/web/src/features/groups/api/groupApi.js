import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

export async function getGroupById(groupId) {
    const res = await client.get(`/projects/${groupId}`);
    return unwrap(res);
}

export async function approveGroupLink(groupId, linkType, lecturerId) {
    const res = await client.post(`/projects/${groupId}/links/${linkType}/approve`);
    return unwrap(res);
}

export async function rejectGroupLink(groupId, linkType, lecturerId) {
    const res = await client.post(`/projects/${groupId}/links/${linkType}/reject`);
    return unwrap(res);
}

export async function updateStudentScore(groupId, studentId, score) {
    const res = await client.put(`/projects/${groupId}/students/${studentId}/score`, { score });
    return unwrap(res);
}
