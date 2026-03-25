import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapProject, mapProjectList } from "../../projects/api/mappers/projectMapper.js";

/**
 * studentApi.js — All /api/student/me/* endpoints
 * Route prefix: /api/student (StudentController.cs — Authorize: STUDENT)
 */

/** GET /api/student/me/stats — Thống kê cá nhân sinh viên */
export async function getMyStats() {
    const res = await client.get("/student/me/stats");
    return unwrap(res);
}

/** GET /api/student/me/courses — Lớp học của tôi */
export async function getMyCourses(params = {}) {
    const res = await client.get("/student/me/courses", { params });
    return unwrap(res);
}

/** GET /api/student/me/projects — Nhóm dự án của tôi */
export async function getMyProjects(params = {}) {
    const res = await client.get("/student/me/projects", { params });
    const raw = unwrap(res);

    // Some BE variants return:
    // - paged response: { items: [...] }
    // - plain array: [...]
    if (Array.isArray(raw)) {
        const items = raw.map(mapProject).filter(Boolean);
        return { items, totalCount: items.length, page: 1, pageSize: items.length };
    }

    // Fallback to paged mapper (supports items/Items/results legacy)
    return mapProjectList(raw);
}

/** GET /api/student/me/commits — Commits của tôi */
export async function getMyCommits(params = {}) {
    const res = await client.get("/student/me/commits", { params });
    return unwrap(res);
}

/** GET /api/student/me/tasks — Jira tasks được giao */
export async function getMyTasks(params = {}) {
    const res = await client.get("/student/me/tasks", { params });
    return unwrap(res);
}

/** GET /api/student/me/grades — Điểm số */
export async function getMyGrades(params = {}) {
    const res = await client.get("/student/me/grades", { params });
    return unwrap(res);
}

/** GET /api/student/me/warnings — Cảnh báo cá nhân */
export async function getMyWarnings() {
    const res = await client.get("/student/me/warnings");
    return unwrap(res);
}

/** GET /api/student/me/heatmap?days=35 — Heatmap đóng góp */
export async function getMyHeatmap(days = 35) {
    const res = await client.get("/student/me/heatmap", { params: { days } });
    return unwrap(res);
}

/** GET /api/student/me/commit-activity?days=7 — Biểu đồ commit tuần */
export async function getMyCommitActivity(days = 7) {
    const res = await client.get("/student/me/commit-activity", { params: { days } });
    return unwrap(res);
}

/** GET /api/student/me/deadlines — Deadline sắp đến */
export async function getMyDeadlines() {
    const res = await client.get("/student/me/deadlines");
    return unwrap(res);
}

/** GET /api/student/me/invitations — Lời mời tham gia nhóm (qua StudentController) */
export async function getMyInvitations(params = {}) {
    const res = await client.get("/student/me/invitations", { params });
    return unwrap(res);
}

/** POST /api/invitations/{id}/accept — Chấp nhận lời mời */
export async function acceptInvitation(invitationId) {
    const res = await client.post(`/invitations/${invitationId}/accept`);
    return unwrap(res);
}

/** POST /api/invitations/{id}/reject — Từ chối lời mời */
export async function rejectInvitation(invitationId) {
    const res = await client.post(`/invitations/${invitationId}/reject`);
    return unwrap(res);
}
