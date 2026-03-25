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
        subjectId: String(subj.id ?? subj.Id ?? beCourse.subjectId ?? beCourse.SubjectId ?? ""),
        subject: {
            id: String(subj.id ?? subj.Id ?? beCourse.subjectId ?? beCourse.SubjectId ?? ""),
            code: subj.subjectCode ?? subj.SubjectCode ?? beCourse.subjectCode ?? beCourse.SubjectCode ?? "",
            name: subj.subjectName ?? subj.SubjectName ?? beCourse.subjectName ?? beCourse.SubjectName ?? "",
        },

        // ── Semester ───────────────────────────────────────────────
        semesterId: String(sem.id ?? sem.Id ?? beCourse.semesterId ?? beCourse.SemesterId ?? ""),
        semester: {
            id: String(sem.id ?? sem.Id ?? beCourse.semesterId ?? beCourse.SemesterId ?? ""),
            name: (typeof sem === 'string' ? sem : sem.name) ?? sem.Name ?? beCourse.semesterName ?? beCourse.SemesterName ?? "",
            code: (typeof sem === 'string' ? sem : sem.name) ?? sem.Name ?? beCourse.semesterName ?? beCourse.SemesterName ?? "",   // mock dùng .code, BE chỉ có .name
            startDate: sem.startDate ?? sem.StartDate ?? null,
            endDate: sem.endDate ?? sem.EndDate ?? null,
        },

        // ── Students & capacity ────────────────────────────────────
        currentStudents: beCourse.enrolledStudentsCount ?? beCourse.EnrolledStudentsCount ?? 0,
        studentCount: beCourse.enrolledStudentsCount ?? beCourse.EnrolledStudentsCount ?? 0,
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

        // ── Groups & Enrollments (from BE CourseDetailResponse) ────
        groups: (beCourse.groups || beCourse.Groups || []).map(g => ({
            id: String(g.id || g.Id || ""),
            name: g.name || g.Name || "",
            status: g.status || g.Status || "PENDING",
            githubStatus: g.githubStatus || g.GithubStatus || "NONE",
            jiraStatus: g.jiraStatus || g.JiraStatus || "NONE",
            topic: g.topic || g.Topic || "",
            integration: g.integration || g.Integration || null,
            team: (g.team || g.Team || []).map(tm => ({
                studentId: String(tm.userId || tm.UserId || ""),
                studentName: tm.fullName || tm.FullName || "",
                studentCode: tm.studentCode || tm.StudentCode || ""
            }))
        })),
        enrollments: (beCourse.enrollments || beCourse.Enrollments || []).map(e => ({
            userId: String(e.userId || e.UserId || ""),
            fullName: e.fullName || e.FullName || "",
            studentCode: e.studentCode || e.StudentCode || "",
            studentId: e.studentId || e.StudentId || "",
            email: e.email || e.Email || ""
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
