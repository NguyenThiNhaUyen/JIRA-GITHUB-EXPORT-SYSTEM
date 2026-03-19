import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";

/**
 * GET /api/lecturers/{id}/workload
 * Workload của giảng viên theo ID (Admin dung)
 * BE: LecturersController → GetWorkload(id)
 */
export async function getLecturerWorkload(lecturerId) {
    const res = await client.get(`/lecturers/${lecturerId}/workload`);
    return unwrap(res);
}

/**
 * GET /api/lecturers/me/workload
 * Workload của giảng viên đang đăng nhập (self-service)
 * BE: LecturersController → GetMyWorkload()
 */
export async function getLecturerMeWorkload() {
    const res = await client.get("/lecturers/me/workload");
    return unwrap(res);
}

/**
 * GET /api/lecturers/me/courses
 * Danh sách lớp học (kèm thống kê) của giảng viên đang đăng nhập
 * BE: LecturersController → GetMyCourses()
 * Trả về: List<LecturerCourseStatResponse>
 */
export async function getLecturerMeCourses() {
    const res = await client.get("/lecturers/me/courses");
    return unwrap(res);
}

/**
 * GET /api/analytics/lecturer/activity-logs?limit=10
 * Activity logs gần đây của giảng viên (LECTURER/ADMIN)
 * BE: AnalyticsController → GetLecturerActivityLogs(limit)
 */
export async function getLecturerActivityLogs(limit = 5) {
    const res = await client.get("/analytics/lecturer/activity-logs", { params: { limit } });
    return unwrap(res);
}
