/**
 * courseApi.js — API calls cho Courses
 *
 * baseURL đã là /api, nên các path ở đây chỉ cần /courses (KHÔNG có /api)
 */
import client from "./client.js";

/**
 * GET /api/courses
 * BE tự filter theo role JWT:
 *   ADMIN    → tất cả khoá học
 *   LECTURER → chỉ khoá dạy
 *   STUDENT  → chỉ khoá đăng ký
 *
 * @param {{ page?: number, pageSize?: number }} params
 * @returns {Promise<{ data: { results: CourseDetailResponse[], totalCount: number } }>}
 */
export async function getCourses(params = {}) {
    return client.get("/courses", { params });
}

/**
 * GET /api/courses/:id
 */
export async function getCourseById(id) {
    return client.get(`/courses/${id}`);
}

/**
 * POST /api/courses  [ADMIN only]
 * @param {{ courseCode, courseName, subjectId, semesterId }} body
 */
export async function createCourse(body) {
    return client.post("/courses", body);
}

/**
 * PUT /api/courses/:id  [ADMIN only]
 */
export async function updateCourse(id, body) {
    return client.put(`/courses/${id}`, body);
}

/**
 * DELETE /api/courses/:id  [ADMIN only]
 */
export async function deleteCourse(id) {
    return client.delete(`/courses/${id}`);
}

/**
 * POST /api/courses/:id/lecturers  [ADMIN only]
 * @param {number} courseId
 * @param {number} lecturerUserId
 */
export async function assignLecturer(courseId, lecturerUserId) {
    return client.post(`/courses/${courseId}/lecturers`, { lecturerUserId });
}

/**
 * POST /api/courses/:id/enrollments  [ADMIN only]
 * @param {number} courseId
 * @param {number[]} studentUserIds
 */
export async function enrollStudents(courseId, studentUserIds) {
    return client.post(`/courses/${courseId}/enrollments`, { studentUserIds });
}
