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

/**
 * Map một CourseDetailResponse từ BE sang FE course shape
 * @param {object} beCourse - CourseDetailResponse từ BE
 * @returns {object} - FE course shape tương thích mock/db.js
 */
export function mapCourse(beCourse) {
    if (!beCourse) return null;

    const subj = beCourse.subject ?? {};
    const sem = beCourse.semester ?? {};
    const lecs = beCourse.lecturers ?? [];

    return {
        // ── Core identity ──────────────────────────────────────────
        id: String(beCourse.id ?? ""),
        code: beCourse.courseCode ?? "",
        name: beCourse.courseName ?? "",

        // ── Subject ───────────────────────────────────────────────
        subjectId: String(subj.id ?? ""),
        subject: {
            id: String(subj.id ?? ""),
            code: subj.subjectCode ?? "",
            name: subj.subjectName ?? "",
        },

        // ── Semester ───────────────────────────────────────────────
        semesterId: String(sem.id ?? ""),
        semester: {
            id: String(sem.id ?? ""),
            name: sem.name ?? "",
            code: sem.name ?? "",
            startDate: sem.startDate ?? null,
            endDate: sem.endDate ?? null,
        },

        // ── Students & capacity ────────────────────────────────────
        currentStudents: beCourse.currentStudents ?? beCourse.enrolledStudentsCount ?? 0,
        maxStudents: beCourse.maxStudents ?? 0,

        // ── Status ────────────────────────────────────────────────
        status: beCourse.status ?? "UNKNOWN",

        // ── Lecturers ──────────────────────────────────────────────
        lecturers: lecs.map(l => ({
            id: String(l.userId ?? ""),
            name: l.fullName ?? "",
            code: l.lecturerCode ?? "",
            email: l.officeEmail ?? "",
        })),

        // ── Projects count ─────────────────────────────────────────
        projectsCount: beCourse.projectsCount ?? 0,
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
