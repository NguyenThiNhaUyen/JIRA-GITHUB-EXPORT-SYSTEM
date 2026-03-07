/**
 * userMapper.js — BE UserDetailResponse → FE user shape
 */

export function mapUser(beUser) {
    if (!beUser) return null;

    // BE role list -> single role string (fallback logic)
    const roles = beUser.roles || beUser.Roles || [];
    let role = "STUDENT";
    if (roles.includes("ADMIN")) role = "ADMIN";
    else if (roles.includes("LECTURER")) role = "LECTURER";

    return {
        id: String(beUser.id || beUser.Id),
        name: beUser.fullName || beUser.FullName || "",
        email: beUser.email || beUser.Email || "",
        role: role,
        status: (beUser.enabled ?? beUser.Enabled) ? "ACTIVE" : "DISABLED",
        studentId: beUser.studentCode || beUser.StudentCode || null,
        lecturerCode: beUser.lecturerCode || beUser.LecturerCode || null,
        createdAt: beUser.createdAt || beUser.CreatedAt
    };
}

export function mapUserList(beData) {
    if (beData && (beData.results || beData.Results)) {
        const results = beData.results || beData.Results || [];
        return {
            items: results.map(mapUser),
            totalCount: beData.totalCount || beData.TotalCount || results.length,
            page: beData.page || beData.Page || 1,
            pageSize: beData.pageSize || beData.PageSize || results.length
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
