/**
 * userMapper.js — BE UserDetailResponse → FE user shape
 */

export function mapUser(beUser) {
    if (!beUser) return null;

    // BE may return roles as array OR as a single role string
    const roles = beUser.roles || beUser.Roles || [];
    const singleRole = beUser.role || beUser.Role || "";
    const allRoles = Array.isArray(roles) ? roles : [roles];
    // Insert the single role string if not already in the array
    if (singleRole && !allRoles.includes(singleRole)) allRoles.push(singleRole);

    let role = "STUDENT";
    if (allRoles.some(r => r === "ADMIN" || r === "SUPER_ADMIN")) role = "ADMIN";
    else if (allRoles.some(r => r === "LECTURER")) role = "LECTURER";

    // BE uses `enabled` (bool) for active status
    const enabled = beUser.enabled ?? beUser.Enabled;
    const statusStr = beUser.status || beUser.Status;
    let status;
    if (typeof enabled === "boolean") {
        status = enabled ? "ACTIVE" : "DISABLED";
    } else if (statusStr) {
        status = statusStr;
    } else {
        status = "ACTIVE";
    }

    return {
        id: String(beUser.id || beUser.Id || beUser.userId || beUser.UserId || ""),
        name: beUser.fullName || beUser.FullName || beUser.name || beUser.Name || "",
        email: beUser.email || beUser.Email || "",
        role,
        status,
        studentId: beUser.studentCode || beUser.StudentCode || beUser.studentId || beUser.StudentId || null,
        studentCode: beUser.studentCode || beUser.StudentCode || null,
        lecturerCode: beUser.lecturerCode || beUser.LecturerCode || null,
        department: beUser.department || beUser.Department || null,
        createdAt: beUser.createdAt || beUser.CreatedAt || null,
    };
}

export function mapUserList(beData) {
    if (beData && (beData.results || beData.Results || beData.items || beData.Items)) {
        const results = beData.results || beData.Results || beData.items || beData.Items || [];
        return {
            items: results.map(mapUser),
            totalCount: beData.totalCount || beData.TotalCount || beData.totalItems || beData.TotalItems || results.length,
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
