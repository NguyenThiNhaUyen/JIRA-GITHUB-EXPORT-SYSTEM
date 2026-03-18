/**
 * userMapper.js â€” BE UserDetailResponse â†’ FE user shape
 */

export function mapUser(beUser) {
    if (!beUser) return null;

    const rawRoles = beUser.roles || beUser.Roles || [];
    const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
    
    let role = "STUDENT";
    if (roles.some(r => String(r).toUpperCase() === "ADMIN")) role = "ADMIN";
    else if (roles.some(r => String(r).toUpperCase() === "LECTURER")) role = "LECTURER";

    return {
        id: String(beUser.user_id || beUser.id || beUser.Id || ""),
        name: beUser.full_name || beUser.fullName || beUser.FullName || beUser.name || "",
        email: beUser.email || beUser.Email || "",
        role: role,
        status: beUser.enabled ?? beUser.Enabled ? "ACTIVE" : "DISABLED",
        studentId: beUser.student_code || beUser.studentCode || beUser.StudentCode || null,
        lecturerCode: beUser.lecturer_code || beUser.lecturerCode || beUser.LecturerCode || null,
        createdAt: beUser.created_at || beUser.createdAt || beUser.CreatedAt || null,
        department: beUser.department || beUser.Department || null,
        assignedCourses: beUser.assigned_courses || beUser.assignedCourses || beUser.AssignedCourses || [],
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

