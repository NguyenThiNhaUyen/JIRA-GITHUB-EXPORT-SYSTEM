/**
 * courseMapper.js — Adapter: BE CourseDetailResponse → FE Mock shape
 */

/**
 * Map một CourseDetailResponse từ BE sang FE course shape
 * @param {object} beCourse - CourseDetailResponse từ BE
 * @returns {object} - FE course shape tương thích mock/db.js
 */
export function mapCourse(beCourse) {
    if (!beCourse) return null;

    const subj = beCourse.subject ?? beCourse.Subject ?? {};
    const sem = beCourse.semester ?? beCourse.Semester ?? {};
    const lecs = beCourse.lecturers ?? beCourse.Lecturers ?? [];

    return {
        // ── Core identity ──────────────────────────────────────────
        id: String(beCourse.id ?? beCourse.Id),
        code: beCourse.courseCode ?? beCourse.CourseCode ?? "",
        name: beCourse.courseName ?? beCourse.CourseName ?? "",

        // ── Subject (nested, FE vẫn có thể dùng subjectId để lookup) ──
        subjectId: String(subj.id ?? subj.Id ?? ""),
        subject: {
            id: String(subj.id ?? subj.Id ?? ""),
            code: subj.subjectCode ?? subj.SubjectCode ?? "",
            name: subj.subjectName ?? subj.SubjectName ?? "",
        },

        // ── Semester ───────────────────────────────────────────────
        semesterId: String(sem.id ?? sem.Id ?? ""),
        semester: {
            id: String(sem.id ?? sem.Id ?? ""),
            name: sem.name ?? sem.Name ?? "",
            code: sem.name ?? sem.Name ?? "",   // mock dùng .code, BE chỉ có .name
            startDate: sem.startDate ?? sem.StartDate ?? null,
            endDate: sem.endDate ?? sem.EndDate ?? null,
        },

        // ── Students & capacity ────────────────────────────────────
        currentStudents: beCourse.enrolledStudentsCount ?? beCourse.EnrolledStudentsCount ?? 0,
        maxStudents: beCourse.maxStudents ?? beCourse.MaxStudents ?? 40,

        // ── Status ────────────────────────────────────────────────
        status: beCourse.status ?? beCourse.Status ?? "ACTIVE",

        // ── Lecturers ──────────────────────────────────────────────
        lecturers: lecs.map(l => ({
            id: String(l.userId ?? l.UserId ?? ""),
            name: l.fullName ?? l.FullName ?? "",
            code: l.lecturerCode ?? l.LecturerCode ?? "",
            email: l.officeEmail ?? l.OfficeEmail ?? "",
        })),

        // ── Projects count ─────────────────────────────────────────
        projectsCount: beCourse.projectsCount ?? beCourse.ProjectsCount ?? 0,
    };
}

/**
 * Map danh sách courses (từ PagedResponse.results hoặc array)
 * @param {object[]|object} beData - Có thể là array hoặc PagedResponse { results, totalCount, ... }
 * @returns {{ items: object[], totalCount: number, page: number, pageSize: number }}
 */
export function mapCourseList(beData) {
    if (!beData) return { items: [], totalCount: 0, page: 1, pageSize: 0 };

    // Support both 'items'/'Items' (standard PagedResponse) and 'results'/'Results' (legacy)
    const list = beData.items ?? beData.Items ?? beData.results ?? beData.Results;

    if (list !== undefined && Array.isArray(list)) {
        return {
            items: list.map(mapCourse),
            totalCount: beData.totalCount ?? beData.TotalCount ?? list.length,
            page: beData.page ?? beData.Page ?? 1,
            pageSize: beData.pageSize ?? beData.PageSize ?? list.length,
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
