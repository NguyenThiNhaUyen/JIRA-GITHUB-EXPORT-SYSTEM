/**
 * notificationMapper.js — BE NotificationResponse → FE shape
 */

export function mapNotification(beNotif) {
    if (!beNotif) return null;

    return {
        id: beNotif.id || beNotif.Id || "",
        content: beNotif.message || beNotif.Message || beNotif.content || beNotif.Content || "",
        title: beNotif.title || beNotif.Title || (beNotif.type === 'INVITATION' || beNotif.Type === 'INVITATION' ? 'Lời mời nhóm' : 'Thông báo hệ thống'),
        type: (beNotif.type || beNotif.Type || "SYSTEM").toUpperCase(),
        isRead: beNotif.isRead ?? beNotif.IsRead ?? false,
        createdAt: beNotif.timestamp || beNotif.Timestamp || beNotif.createdAt || beNotif.CreatedAt || null,
        // Dữ liệu mở rộng cho lời mời nhóm
        projectName: beNotif.projectName || beNotif.ProjectName || null,
        invitedByName: beNotif.invitedByName || beNotif.InvitedByName || null,
        invitationId: beNotif.invitationId || beNotif.InvitationId || null
    };
}

export function mapNotificationList(beData) {
    if (!beData) return { items: [], totalCount: 0, page: 1, pageSize: 0 };

    if (beData.results !== undefined || beData.Results !== undefined || beData.items !== undefined || beData.Items !== undefined) {
        const results = beData.items ?? beData.Items ?? beData.results ?? beData.Results ?? [];
        return {
            items: results.map(mapNotification),
            totalCount: beData.totalCount ?? beData.TotalCount ?? beData.totalItems ?? beData.TotalItems ?? results.length,
            page: beData.page ?? beData.Page ?? 1,
            pageSize: beData.pageSize ?? beData.PageSize ?? results.length
        };
    }

    if (Array.isArray(beData)) {
        return {
            items: beData.map(mapNotification),
            totalCount: beData.length,
            page: 1,
            pageSize: beData.length
        };
    }

    return { items: [], totalCount: 0, page: 1, pageSize: 0 };
}






