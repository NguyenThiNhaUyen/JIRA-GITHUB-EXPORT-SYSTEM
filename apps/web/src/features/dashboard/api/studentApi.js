import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/analytics/student/stats
 */
export async function getStudentStats() {
    const res = await client.get("/student/me/stats");
    return unwrap(res);
}

/**
 * GET /api/analytics/student/deadlines
 */
export async function getStudentDeadlines() {
    const res = await client.get("/student/me/deadlines");
    return unwrap(res);
}

/**
 * GET /api/student/me/heatmap (BE v2.1)
 */
export async function getStudentHeatmap(days = 35) {
    const res = await client.get("/student/me/heatmap", { params: { days } });
    return unwrap(res);
}

/**
 * GET /api/student/me/commit-activity?days=7 (BE v2.1)
 */
export async function getStudentCommitActivity(days = 7) {
    const res = await client.get("/student/me/commit-activity", { params: { days } });
    return unwrap(res);
}

/**
 * GET /api/student/me/projects (BE v2.1)
 */
export async function getStudentProjects(params = {}) {
    const res = await client.get("/student/me/projects", { params });
    return unwrap(res);
}

/**
 * GET /api/student/me/courses?page=1&pageSize=20
 * Danh sách các lớp học của sinh viên
 */
export async function getStudentCourses(params = {}) {
    const res = await client.get("/student/me/courses", { params });
    return unwrap(res);
}

/**
 * GET /api/student/me/commits?page=1&pageSize=50
 * Danh sách commits của sinh viên
 */
export async function getStudentCommits(params = {}) {
    const res = await client.get("/student/me/commits", { params });
    return unwrap(res);
}

/**
 * GET /api/student/me/tasks?page=1&pageSize=50
 * Danh sách Jira tasks của sinh viên
 */
export async function getStudentTasks(params = {}) {
    const res = await client.get("/student/me/tasks", { params });
    return unwrap(res);
}

/**
 * GET /api/student/me/grades
 * Điểm số của sinh viên
 */
export async function getStudentGrades(params = {}) {
    const res = await client.get("/student/me/grades", { params });
    return unwrap(res);
}

/**
 * GET /api/student/me/warnings
 * Cảnh báo (inactive, commit it,...) cho sinh viên
 */
export async function getStudentWarnings() {
    const res = await client.get("/student/me/warnings");
    return unwrap(res);
}

/**
 * GET /api/student/me/invitations?page=1&pageSize=20
 * Danh sách lời mời tham gia nhóm
 */
export async function getStudentInvitations(params = {}) {
    const res = await client.get("/student/me/invitations", { params });
    return unwrap(res);
}
