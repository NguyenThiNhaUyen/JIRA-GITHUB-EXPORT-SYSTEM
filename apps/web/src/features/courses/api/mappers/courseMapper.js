/**
 * courseMapper.js — Adapter: BE CourseDetailResponse → FE shape
 */

import { mapProject } from "../../../projects/api/mappers/projectMapper.js";

/**
 * Map một CourseDetailResponse từ BE sang FE course shape
 * @param {object} beCourse - CourseDetailResponse từ BE
 * @returns {object} - FE course shape
 */
export function mapCourse(beCourse) {
    if (!beCourse) return null;

    const subj = beCourse.subject || {};
    const sem = beCourse.semester || {};
    const lecs = beCourse.lecturers || [];
    const enrs = beCourse.enrollments || beCourse.enrolledStudents || [];
    const projs = beCourse.projects || beCourse.groups || [];

    return {
        // ── Core identity ──────────────────────────────────────────
        id: String(beCourse.id || beCourse.Id || ""),
        code: beCourse.courseCode || beCourse.course_code || beCourse.CourseCode || "",
        name: beCourse.courseName || beCourse.course_name || beCourse.CourseName || "",

        // ── Subject ───────────────────────────────────────────────
        subjectId: String(subj.id || beCourse.subjectId || beCourse.subject_id || beCourse.SubjectId || ""),
        subject: {
            id: String(subj.id || ""),
            code: subj.subjectCode || subj.subject_code || subj.SubjectCode || beCourse.subject_code || "",
            name: subj.subjectName || subj.subject_name || subj.SubjectName || beCourse.subject_name || "",
        },

        // ── Semester ───────────────────────────────────────────────
        semesterId: String(sem.id || beCourse.semesterId || beCourse.semester_id || beCourse.SemesterId || ""),
        semester: {
            id: String(sem.id || ""),
            name: sem.name || sem.Name || beCourse.semester_name || "",
            code: sem.code || sem.Code || sem.name || sem.Name || "",
            startDate: sem.startDate || sem.StartDate || sem.start_date || null,
            endDate: sem.endDate || sem.EndDate || sem.end_date || null,
        },

        // ── Students & capacity ────────────────────────────────────
        currentStudents: beCourse.currentStudents ?? beCourse.enrolledStudentsCount ?? 0,
        maxStudents: beCourse.maxStudents ?? 0,

        // ── Status ────────────────────────────────────────────────
        status: beCourse.status ?? "UNKNOWN",

        // ── Lecturers ──────────────────────────────────────────────
        lecturers: lecs.map(l => ({
            id: String(l.userId || l.user_id || l.id || ""),
            name: l.fullName || l.full_name || l.name || l.FullName || "",
            code: l.lecturerCode || l.lecturer_code || l.LecturerCode || "",
            email: l.officeEmail || l.email || l.Email || "",
        })),

        // ── Groups/Projects ────────────────────────────────────────
        groups: projs.map(mapProject),
        projectsCount: beCourse.projectsCount || beCourse.projects_count || projs.length || 0,
        
        // ── Enrollments ───────────────────────────────────────────
        enrollments: enrs.map(e => ({
            userId: String(e.userId || e.user_id || e.id || ""),
            fullName: e.fullName || e.full_name || e.name || "",
            studentCode: e.studentCode || e.student_code || "",
            email: e.email || "",
        })),
    };
}

/**
 * Map danh sách courses (từ PagedResponse.results hoặc array)
 * @param {object[]|object} beData - Có thể là array hoặc PagedResponse { results, totalCount, ... }
 * @returns {{ items: object[], totalCount: number, page: number, pageSize: number }}
 */
export function mapCourseList(beData) {
    // PagedResponse shape: { items: [], totalCount, page, pageSize }
    if (beData && (beData.items !== undefined || beData.Items !== undefined || beData.results !== undefined || beData.Results !== undefined)) {
        const results = beData.items ?? beData.Items ?? beData.results ?? beData.Results ?? [];
        return {
            items: results.map(mapCourse),
            totalCount: beData.totalCount ?? beData.TotalCount ?? beData.totalItems ?? beData.TotalItems ?? results.length,
            page: beData.page ?? beData.Page ?? 1,
            pageSize: beData.pageSize ?? beData.PageSize ?? results.length,
        };
    }

    // Plain array fallback
    if (Array.isArray(beData)) {
        return {
            items: beData.map(mapCourse),
            totalCount: beData.length,
            page: 1,
            pageSize: beData.length,
        };
    }

    return { items: [], totalCount: 0, page: 1, pageSize: 0 };
}
