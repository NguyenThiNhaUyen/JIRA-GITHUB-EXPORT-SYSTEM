/**
 * courseApi.js — API calls cho Courses
 */
import client from "../../../api/client.js";
import { unwrap } from "../../../api/unwrap.js";
import { mapCourse, mapCourseList } from "./mappers/courseMapper.js";

/**
 * Map PagedResponse<EnrollmentInfo> từ BE sang FE student shape
 * EnrollmentInfo: { UserId, FullName, StudentCode, StudentId, Email }
 * FE shape: { id, name, studentCode, email }
 */
function mapEnrollmentList(beData) {
    const mapOne = (e) => ({
        id: String(e.userId || e.UserId || e.id || ""),
        name: e.fullName || e.FullName || e.studentName || "",
        studentCode: e.studentCode || e.StudentCode || e.StudentId || "",
        email: e.email || e.Email || "",
    });
    // PagedResponse shape
    if (beData && (beData.items !== undefined || beData.Items !== undefined || beData.results !== undefined)) {
        const rows = beData.items ?? beData.Items ?? beData.results ?? beData.Results ?? [];
        return {
            items: rows.map(mapOne),
            totalCount: beData.totalCount ?? beData.TotalCount ?? rows.length,
            page: beData.page ?? beData.Page ?? 1,
            pageSize: beData.pageSize ?? beData.PageSize ?? rows.length,
        };
    }
    if (Array.isArray(beData)) {
        return { items: beData.map(mapOne), totalCount: beData.length, page: 1, pageSize: beData.length };
    }
    return { items: [], totalCount: 0, page: 1, pageSize: 0 };
}

/**
 * GET /api/courses
 */
export async function getCourses(params = {}) {
    const res = await client.get("/courses", { params });
    const payload = unwrap(res);          
    return mapCourseList(payload);        
}

/**
 * GET /api/courses/:id
 */
export async function getCourseById(id) {
    const res = await client.get(`/courses/${id}`);
    return mapCourse(unwrap(res));
}

/**
 * POST /api/courses  [ADMIN only]
 */
export async function createCourse(body) {
    const res = await client.post("/courses", body);
    return mapCourse(unwrap(res));
}

/**
 * PUT /api/courses/:id  [ADMIN only]
 */
export async function updateCourse(id, body) {
    const res = await client.put(`/courses/${id}`, body);
    return mapCourse(unwrap(res));
}

/**
 * DELETE /api/courses/:id  [ADMIN only]
 */
export async function deleteCourse(id) {
    const res = await client.delete(`/courses/${id}`);
    return unwrap(res);
}

/**
 * POST /api/courses/:id/lecturers  [ADMIN only]
 * Fallback sang API /admin/bulk-assign vì API cũ bị 403 Forbidden bên BE
 */
export async function assignLecturer(courseId, lecturerUserId) {
    const res = await client.post(`/admin/bulk-assign`, {
        assignments: [{ courseId: Number(courseId), lecturerId: Number(lecturerUserId) }]
    });
    return unwrap(res);
}

/**
 * POST /api/courses/:id/enrollments  [ADMIN only]
 */
export async function enrollStudents(courseId, studentUserIds) {
    const res = await client.post(`/courses/${courseId}/enrollments`, { studentUserIds });
    return unwrap(res);
}

/**
 * POST /api/courses/:id/enrollments/import  [ADMIN & LECTURER]
 * Uploads an Excel file (.xlsx) for bulk student enrollment.
 */
export async function importStudents(courseId, fileOrFormData) {
    let body = fileOrFormData;
    if (fileOrFormData instanceof File) {
        body = new FormData();
        body.append("file", fileOrFormData);
    }
    
    // NOTE: client.js intercepts to handle Content-Type if needed
    const res = await client.post(`/courses/${courseId}/enrollments/import`, body);
    return unwrap(res);
}

/**
 * DELETE /api/courses/:id/lecturers/:lecturerId  [ADMIN only]
 */
export async function removeLecturer(courseId, lecturerUserId) {
    const res = await client.delete(`/courses/${courseId}/lecturers/${lecturerUserId}`);
    return unwrap(res);
}

/**
 * DELETE /api/courses/:id/enrollments/:studentId  [ADMIN only]
 */
export async function unenrollStudent(courseId, studentUserId) {
    const res = await client.delete(`/courses/${courseId}/enrollments/${studentUserId}`);
    return unwrap(res);
}

/**
 * GET /api/courses/:id/students
 * BE trả về PagedResponse<EnrollmentInfo>: { UserId, FullName, StudentCode, StudentId, Email }
 */
export async function getEnrolledStudents(courseId, params = {}) {
    const res = await client.get(`/courses/${courseId}/students`, { params });
    return mapEnrollmentList(unwrap(res));
}
