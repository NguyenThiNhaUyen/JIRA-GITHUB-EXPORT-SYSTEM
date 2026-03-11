/**
 * courseApi.js — API calls cho Courses
 *
 * baseURL đã là /api, nên các path ở đây chỉ cần /courses (KHÔNG có /api)
 *
 * Pipeline:
 *   client.js interceptor → trả về ApiResponse object (response.data của axios)
 *   unwrap()              → lấy payload T từ ApiResponse.data
 *   mapCourseList/mapCourse → convert BE DTO → FE shape
 */
import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapCourse, mapCourseList } from "./mappers/courseMapper.js";
import { mapUserList } from "../../users/api/mappers/userMapper.js";

/**
 * GET /api/courses
 * BE tự filter theo role JWT:
 *   ADMIN    → tất cả khoá học (PagedResponse<CourseDetailResponse>)
 *   LECTURER → khoá dạy của mình
 *   STUDENT  → khoá đã đăng ký
 *
 * @param {{ page?: number, pageSize?: number }} params
 * @returns {Promise<{ items: FECourse[], totalCount: number, page: number, pageSize: number }>}
 */
export async function getCourses(params = {}) {
    const res = await client.get("/courses", { params });
    const payload = unwrap(res);          // PagedResponse<CourseDetailResponse>
    return mapCourseList(payload);        // → { items: FECourse[], totalCount, page, pageSize }
}

/**
 * GET /api/courses/:id
 * @param {number|string} id
 * @returns {Promise<FECourse>}
 */
export async function getCourseById(id) {
    const res = await client.get(`/courses/${id}`);
    return mapCourse(unwrap(res));
}

/**
 * POST /api/courses  [ADMIN only]
 * @param {{ courseCode: string, courseName: string, subjectId: number, semesterId: number }} body
 * @returns {Promise<FECourse>}
 */
export async function createCourse(body) {
    const res = await client.post("/courses", body);
    return mapCourse(unwrap(res));
}

/**
 * PUT /api/courses/:id  [ADMIN only]
 * @param {number|string} id
 * @param {object} body
 * @returns {Promise<FECourse>}
 */
export async function updateCourse(id, body) {
    const res = await client.put(`/courses/${id}`, body);
    return mapCourse(unwrap(res));
}

/**
 * DELETE /api/courses/:id  [ADMIN only]
 * @param {number|string} id
 */
export async function deleteCourse(id) {
    return client.delete(`/courses/${id}`);
}

/**
 * POST /api/courses/:id/lecturers  [ADMIN only]
 * @param {number|string} courseId
 * @param {number} lecturerUserId
 */
export async function assignLecturer(courseId, lecturerUserId) {
    return client.post(`/courses/${courseId}/lecturers`, { lecturerUserId: Number(lecturerUserId) });
}

/**
 * POST /api/courses/:id/enrollments  [ADMIN only]
 * @param {number|string} courseId
 * @param {number[]} studentUserIds
 */
export async function enrollStudents(courseId, studentUserIds) {
    return client.post(`/courses/${courseId}/enrollments`, { studentUserIds });
}
/**
 * DELETE /api/courses/:id/lecturers/:lecturerId  [ADMIN only]
 */
export async function removeLecturer(courseId, lecturerUserId) {
    return client.delete(`/courses/${courseId}/lecturers/${lecturerUserId}`);
}

/**
 * DELETE /api/courses/:id/enrollments/:studentId  [ADMIN only]
 */
export async function unenrollStudent(courseId, studentUserId) {
    return client.delete(`/courses/${courseId}/enrollments/${studentUserId}`);
}

/**
 * GET /api/courses/:id/students
 */
export async function getEnrolledStudents(courseId, params = {}) {
    const res = await client.get(`/courses/${courseId}/students`, { params });
    return mapUserList(unwrap(res));
}

/**
 * POST /api/courses/:id/enrollments/import  [ADMIN & LECTURER]
 * Uploads an Excel file (.xlsx) for bulk student enrollment.
 * BE will auto-create accounts for new emails, hash password as Student@123, role STUDENT.
 * @param {number|string} courseId
 * @param {File} file - Excel file with columns: StudentCode, FullName, Email
 */
export async function importStudentsExcel(courseId, file) {
    const formData = new FormData();
    formData.append("file", file);
    // NOTE: Do NOT set Content-Type manually — browser/axios auto-adds boundary
    const res = await client.post(
        `/courses/${courseId}/enrollments/import`,
        formData
    );
    return unwrap(res);
}

