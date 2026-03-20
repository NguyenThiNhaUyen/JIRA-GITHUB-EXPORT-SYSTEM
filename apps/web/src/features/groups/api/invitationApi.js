import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

export async function sendProjectInvitation(projectId, studentUserId) {
    const res = await client.post(`/projects/${projectId}/invitations`, { studentUserId });
    return unwrap(res);
}

export async function sendGroupInvitation(groupId, invitedStudentId) {
    // Gọi API chung cho group creation screen
    const res = await client.post("/invitations", { groupId, invitedStudentId });
    return unwrap(res);
}

export async function getMyPendingInvitations(params = {}) {
    const res = await client.get("/invitations/my-pending", { params });
    return unwrap(res);
}

export async function acceptInvitation(id) {
    const res = await client.put(`/invitations/${id}/accept`);
    return unwrap(res);
}

export async function rejectInvitation(id) {
    const res = await client.put(`/invitations/${id}/decline`);
    return unwrap(res);
}
