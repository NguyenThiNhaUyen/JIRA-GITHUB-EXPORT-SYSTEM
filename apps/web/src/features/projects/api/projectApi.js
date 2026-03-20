import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapProject, mapProjectList, mapProjectMetrics } from "./mappers/projectMapper.js";

export async function getProjects(params = {}) {
    const res = await client.get("/projects", { params });
    return mapProjectList(unwrap(res));
}

export async function getProjectById(projectId) {
    const res = await client.get(`/projects/${projectId}`);
    return mapProject(unwrap(res));
}

export async function createProject(body) {
    const res = await client.post("/projects", body);
    return mapProject(unwrap(res));
}

export async function updateProject(projectId, body) {
    const res = await client.put(`/projects/${projectId}`, body);
    return mapProject(unwrap(res));
}

export async function deleteProject(projectId) {
    const res = await client.delete(`/projects/${projectId}`);
    return unwrap(res);
}

export async function addTeamMember(projectId, studentUserId, role = "MEMBER", responsibility = "") {
    const res = await client.post(`/projects/${projectId}/members`, {
        studentUserId,
        teamRole: role,
        responsibility
    });
    return unwrap(res);
}

export async function removeTeamMember(projectId, studentUserId) {
    const res = await client.delete(`/projects/${projectId}/members/${studentUserId}`);
    return unwrap(res);
}

export async function updateTeamMember(projectId, studentUserId, contributionScore) {
    // Note: Backend expectation for PATCH is usually specific field or body
    const res = await client.patch(`/projects/${projectId}/members/${studentUserId}/contribution`, {
        contributionScore
    });
    return unwrap(res);
}

export async function linkIntegration(projectId, body) {
    const res = await client.post(`/projects/${projectId}/integrations`, body);
    return unwrap(res);
}

export async function approveIntegration(projectId) {
    const res = await client.post(`/projects/${projectId}/integrations/approve`);
    return unwrap(res);
}

export async function rejectIntegration(projectId, reason) {
    const res = await client.post(`/projects/${projectId}/integrations/reject`, { reason });
    return unwrap(res);
}

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
