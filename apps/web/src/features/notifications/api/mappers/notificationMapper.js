/**
 * notificationMapper.js — BE NotificationResponse → FE shape (v2.1)
 * BE mới trả về: { id, type, message, timestamp, isRead, metadata }
 */

export function mapNotification(beNotif) {
    if (!beNotif) return null;

    return {
        id: beNotif.id,
        // BE v2.1 dùng "message", fallback "content" cho backward compat
        content: beNotif.message || beNotif.content || "",
        title: beNotif.title || (beNotif.type === 'INVITATION' ? 'Lời mời nhóm' : 'Thông báo hệ thống'),
        type: beNotif.type || "SYSTEM",
        isRead: beNotif.isRead ?? false,
        // BE v2.1 dùng "timestamp", fallback "createdAt" cho backward compat
        createdAt: beNotif.timestamp || beNotif.createdAt,
        // Dữ liệu mở rộng cho lời mời nhóm
        projectName: beNotif.projectName || null,
        invitedByName: beNotif.invitedByName || null,
        invitationId: beNotif.invitationId || null
    };
}

export function mapNotificationList(beData) {
    if (beData && beData.items) {
        return {
            items: beData.items.map(mapNotification),
            totalCount: beData.totalCount || beData.items.length,
            page: beData.page || 1,
            pageSize: beData.pageSize || beData.items.length
        };
    }

    if (Array.isArray(beData)) {
        return beData.map(mapNotification);
    }

    return { items: [], totalCount: 0, page: 1, pageSize: 0 };
}
