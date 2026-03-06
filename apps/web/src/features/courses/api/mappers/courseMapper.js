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
        maxStudents: 40,  // TODO: BE chưa trả về — cần bổ sung vào CourseDetailResponse

        // ── Status ────────────────────────────────────────────────
        // TODO: BE chưa trả về status trực tiếp — hardcode ACTIVE tạm thời
        status: "ACTIVE",

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
    // PagedResponse shape: { results: [], totalCount, page, pageSize }
    if (beData && (beData.results !== undefined || beData.Results !== undefined)) {
        const results = beData.results ?? beData.Results ?? [];
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
