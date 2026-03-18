import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapUser, mapUserList } from "./mappers/userMapper.js";

/**
 * GET /api/users
 * Includes ?role filter
 */
export async function getUsers(role) {
    const res = await client.get("/users", { params: { role, pageSize: 1000 } });
    const payload = unwrap(res);
    return mapUserList(payload).items; // pages expect array
}

/**
 * POST /api/users -> Wait, backend might use different endpoint for creation or invitations
 * For now, map to common logic if exists, or keep mock if BE lacks creation endpoint
 */
export async function createUser(data) {
    // BE might not have a direct POST /users for all roles yet (use invitations if needed)
    // But let's assume it has standard creation for testing.
    const res = await client.post("/users", data);
    return mapUser(unwrap(res));
}

/**
 * PATCH /api/users/:id/role
 */
export async function updateUserRole(id, role) {
    const res = await client.patch(`/users/${id}/role`, { role });
    return unwrap(res);
}

/**
 * PATCH /api/users/:id/status
 */
export async function updateUserStatus(id, enabled) {
    const res = await client.patch(`/users/${id}/status`, { enabled });
    return unwrap(res);
}

/**
 * POST /api/users/:id/reset-password
 */
export async function resetUserPassword(id, newPassword = "Admin@123") {
    const res = await client.post(`/users/${id}/reset-password`, { newPassword });
    return unwrap(res);
}

export async function getStudentLinks(studentId) {
    const res = await client.get(`/users/student/${studentId}/links`);
    return unwrap(res);
}

export async function linkStudentAccounts(studentId, courseId, githubUrl, jiraUrl) {
    const res = await client.post(`/users/student/${studentId}/links`, { courseId, githubUrl, jiraUrl });
    return unwrap(res);
}

