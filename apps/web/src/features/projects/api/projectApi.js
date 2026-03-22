import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapProject, mapProjectList, mapProjectMetrics } from "./mappers/projectMapper.js";

/**
 * GET /api/projects
 * @param {object} params 
 * @returns {Promise<{items: any[], totalCount: number}>}
 */
export async function getProjects(params = {}) {
    const res = await client.get("/projects", { params });
    return mapProjectList(unwrap(res));
}

/**
 * GET /api/projects/:id
 * @param {number|string} projectId 
 */
export async function getProjectById(projectId) {
    const res = await client.get(`/projects/${projectId}`);
    return mapProject(unwrap(res));
}

/**
 * POST /api/projects
 */
export async function createProject(body) {
    const res = await client.post("/projects", body);
    return mapProject(unwrap(res));
}

/**
 * PUT /api/projects/:id
 */
export async function updateProject(projectId, body) {
    const res = await client.put(`/projects/${projectId}`, body);
    return mapProject(unwrap(res));
}

/**
 * DELETE /api/projects/:id
 */
export async function deleteProject(projectId) {
    const res = await client.delete(`/projects/${projectId}`);
    return unwrap(res);
}

/**
 * POST /api/projects/:id/members
 */
export async function addTeamMember(projectId, studentUserId, role = "MEMBER", responsibility = "") {
    const res = await client.post(`/projects/${projectId}/members`, {
        studentUserId,
        teamRole: role,
        responsibility
    });
    return unwrap(res);
}

/**
 * DELETE /api/projects/:id/members/:studentUserId
 */
export async function removeTeamMember(projectId, studentUserId) {
    const res = await client.delete(`/projects/${projectId}/members/${studentUserId}`);
    return unwrap(res);
}

/**
 * PATCH /api/projects/:id/members/:studentUserId
 * Cập nhật role, responsibility...
 */
export async function updateTeamMember(projectId, studentUserId, updates) {
    const res = await client.patch(`/projects/${projectId}/members/${studentUserId}`, updates);
    return unwrap(res);
}

/**
 * PATCH /api/projects/:id/members/:studentUserId/contribution
 * Giảng viên chấm điểm đóng góp
 */
export async function updateContributionScore(projectId, studentUserId, contributionScore) {
    const res = await client.patch(`/projects/${projectId}/members/${studentUserId}/contribution`, {
        contributionScore
    });
    return unwrap(res);
}

/**
 * POST /api/projects/:id/integrations
 */
export async function linkIntegration(projectId, body) {
    const res = await client.post(`/projects/${projectId}/integrations`, body);
    return unwrap(res);
}

/**
 * POST /api/projects/:id/integrations/approve
 */
export async function approveIntegration(projectId) {
    const res = await client.post(`/projects/${projectId}/integrations/approve`);
    return unwrap(res);
}

/**
 * POST /api/projects/:id/integrations/reject
 */
export async function rejectIntegration(projectId, reason) {
    const res = await client.post(`/projects/${projectId}/integrations/reject`, { reason });
    return unwrap(res);
}

// --- Analytics ---

export async function getProjectMetrics(projectId) {
    const res = await client.get(`/projects/${projectId}/metrics`);
    return mapProjectMetrics(unwrap(res));
}

export async function getProjectKanban(projectId) {
    const res = await client.get(`/projects/${projectId}/kanban`);
    return unwrap(res);
}

export async function getProjectCfd(projectId) {
    const res = await client.get(`/projects/${projectId}/cfd`);
    return unwrap(res);
}

export async function getProjectRoadmap(projectId) {
    const res = await client.get(`/projects/${projectId}/roadmap`);
    return unwrap(res);
}

export async function getProjectAgingWip(projectId, limit = 5) {
    const res = await client.get(`/projects/${projectId}/aging-wip`, {
        params: { limit }
    });
    return unwrap(res);
}

export async function getProjectCycleTime(projectId) {
    const res = await client.get(`/projects/${projectId}/cycle-time`);
    return unwrap(res);
}
