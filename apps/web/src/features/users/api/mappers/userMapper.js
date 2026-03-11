/**
 * userMapper.js — BE UserDetailResponse → FE user shape
 */

export function mapUser(beUser) {
    if (!beUser) return null;

    const roles = beUser.roles || [];
    let role = "STUDENT";
    if (roles.includes("ADMIN")) role = "ADMIN";
    else if (roles.includes("LECTURER")) role = "LECTURER";

    return {
        id: String(beUser.user_id || beUser.id || ""),
        name: beUser.full_name || beUser.fullName || beUser.name || "",
        email: beUser.email || "",
        role: role,
        status: beUser.enabled ? "ACTIVE" : "DISABLED",
        studentId: beUser.student_code || beUser.studentCode || null,
        lecturerCode: beUser.lecturer_code || beUser.lecturerCode || null,
        createdAt: beUser.created_at || beUser.createdAt || null,
        department: beUser.department || null,
        assigned_courses: beUser.assigned_courses || beUser.assignedCourses || [],
    };
}

export function mapUserList(beData) {
    // PagedResponse shape: { results: [] or items: [], totalCount, page, pageSize }
    if (beData && (beData.results !== undefined || beData.Results !== undefined || beData.items !== undefined || beData.Items !== undefined)) {
        const results = beData.items ?? beData.Items ?? beData.results ?? beData.Results ?? [];
        return {
            items: results.map(mapUser),
            totalCount: beData.totalCount ?? beData.TotalCount ?? results.length,
            page: beData.page ?? beData.Page ?? 1,
            pageSize: beData.pageSize ?? beData.PageSize ?? results.length
        };
    }

    if (Array.isArray(beData)) {
        return {
            items: beData.map(mapUser),
            totalCount: beData.length,
            page: 1,
            pageSize: beData.length
        };
    }

    return { items: [], totalCount: 0, page: 1, pageSize: 0 };
}
