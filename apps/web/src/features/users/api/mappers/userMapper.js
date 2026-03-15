/**
 * userMapper.js — BE UserDetailResponse → FE user shape
 */

export function mapUser(beUser) {
    if (!beUser) return null;

    // BE role: string (ADMIN | LECTURER | STUDENT)
    const role = beUser.role || "STUDENT";

    return {
        id: String(beUser.id),
        name: beUser.fullName || "",
        email: beUser.email || "",
        role: role,
        status: beUser.enabled ? "ACTIVE" : "DISABLED",
        studentId: beUser.studentId || beUser.studentCode || null,
        lecturerCode: beUser.lecturerCode || null,
        createdAt: beUser.createdAt
    };
}

export function mapUserList(beData) {
    if (beData && beData.items) {
        return {
            items: beData.items.map(mapUser),
            totalCount: beData.totalCount || beData.items.length,
            page: beData.page || 1,
            pageSize: beData.pageSize || beData.items.length
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

