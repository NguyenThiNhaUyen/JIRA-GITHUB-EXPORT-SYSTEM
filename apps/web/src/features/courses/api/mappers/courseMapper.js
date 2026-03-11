/**
 * courseMapper.js — Adapter: BE CourseDetailResponse → FE Mock shape
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  MAPPING TABLE:  Backend DTO  →  Frontend UI field               │
 * ├────────────────────────────────┬─────────────────────────────────┤
 * │  BE (CourseDetailResponse)     │  FE (mock/db.js course shape)   │
 * ├────────────────────────────────┼─────────────────────────────────┤
 * │  id             (long)         │  id             (string→string) │
 * │  courseCode     (string)       │  code           (string)        │
 * │  courseName     (string)       │  name           (string)        │
 * │  subject.id     (long)         │  subjectId      (string)        │
 * │  subject.subjectCode (string)  │  subject.code   (string)        │
 * │  subject.subjectName (string)  │  subject.name   (string)        │
 * │  semester.id    (long)         │  semesterId     (string)        │
 * │  semester.name  (string)       │  semester.name  (string)        │
 * │  semester.startDate (DateTime) │  semester.startDate             │
 * │  semester.endDate   (DateTime) │  semester.endDate               │
 * │  enrolledStudentsCount (int)   │  currentStudents (number)       │
 * │  projectsCount  (int)          │  projectsCount  (number)        │
 * │  lecturers[].userId (long)     │  lecturers[].id                 │
 * │  lecturers[].fullName (string) │  lecturers[].name               │
 * │  lecturers[].lecturerCode      │  lecturers[].code               │
 * │  lecturers[].officeEmail       │  lecturers[].email              │
 * │  ── (không có trong BE) ──     │  maxStudents    → hardcode 40   │
 * │  ── (không có trong BE) ──     │  status         → "ACTIVE" (default) │
 * └────────────────────────────────┴─────────────────────────────────┘
 *
 * NOTE: BE không trả về maxStudents và status trực tiếp trong CourseDetailResponse.
 * Đây là gap cần báo BE bổ sung. Tạm thời hardcode fallback hợp lý.
 */

import { mapProject } from "../../../projects/api/mappers/projectMapper.js";

/**
 * Map một CourseDetailResponse từ BE sang FE course shape
 * @param {object} beCourse - CourseDetailResponse từ BE
 * @returns {object} - FE course shape tương thích mock/db.js
 */
export function mapCourse(beCourse) {
    if (!beCourse) return null;

    const lecs = beCourse.lecturers || [];
    const enrs = beCourse.enrollments || [];
    const projs = beCourse.projects || [];

    return {
        id: String(beCourse.id || ""),
        course_code: beCourse.course_code || "",
        course_name: beCourse.course_name || "",

        // Top level IDs for filtering and form handling
        subjectId: String(beCourse.subject_id || beCourse.subject?.id || ""),
        semesterId: String(beCourse.semester_id || beCourse.semester?.id || ""),

        // Flattened fields from new contract
        subject_code: beCourse.subject_code || beCourse.subject?.subject_code || "",
        semester_name: beCourse.semester_name || beCourse.semester?.name || "",

        // Keep nested for backward compatibility
        subject: {
            id: String(beCourse.subject_id || ""),
            subject_code: beCourse.subject_code || "",
            subject_name: beCourse.subject_name || beCourse.subject_code || "",
        },
        semester: {
            id: String(beCourse.semester_id || ""),
            name: beCourse.semester_name || "",
            code: beCourse.semester_name || "",
        },

        currentStudents: enrs.length || 0,
        max_students: beCourse.max_students || 40,
        status: beCourse.status || "ACTIVE",

        lecturers: lecs.map(l => ({
            id: String(l.user_id || l.id || ""),
            name: l.full_name || l.name || "",
            email: l.email || "",
        })),

        enrollments: enrs.map(e => ({
            user_id: String(e.user_id || ""),
            full_name: e.full_name || "",
            student_code: e.student_code || "",
            email: e.email || "",
        })),

        // Map groups for lecturer manage groups page
        groups: projs.map(mapProject),

        projects_count: beCourse.projects_count || projs.length || 0,
    };
}

/**
 * Map danh sách courses (từ PagedResponse.results hoặc array)
 * @param {object[]|object} beData - Có thể là array hoặc PagedResponse { results, totalCount, ... }
 * @returns {{ items: object[], totalCount: number, page: number, pageSize: number }}
 */
export function mapCourseList(beData) {
    // PagedResponse shape: { results: [] or items: [], totalCount, page, pageSize }
    if (beData && (beData.results !== undefined || beData.Results !== undefined || beData.items !== undefined || beData.Items !== undefined)) {
        const results = beData.items ?? beData.Items ?? beData.results ?? beData.Results ?? [];
        return {
            items: results.map(mapCourse),
            totalCount: beData.totalCount ?? beData.TotalCount ?? results.length,
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
