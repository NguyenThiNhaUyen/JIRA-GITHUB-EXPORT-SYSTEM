/**
 * shared/permissions.js
 * ─────────────────────────────────────────────────────────
 * Centralized Permission Matrix, Status Tokens, and Helpers
 * for the Devora PBL System.
 *
 * Roles: ADMIN | LECTURER | STUDENT
 * Group roles (scoped, not system): LEADER | MEMBER
 * ─────────────────────────────────────────────────────────
 */

/* ═══════════════════════════════════════════════════════════
   PERMISSION MATRIX
   Key: ROLES[role][action] = true → allowed
═══════════════════════════════════════════════════════════ */
export const ROLES = {
    ADMIN: {
        manageSemesters: true,
        manageSubjects: true,
        manageCourses: true,
        assignLecturer: true,
        manageUsers: true,
        viewAdminDashboard: true,
        viewAllCourses: true,
        viewAllGroups: false,  // Admin manages, not groups
        approveLinks: false,
        submitLinks: false,
        uploadSRS: false,
    },
    LECTURER: {
        manageSemesters: false,
        manageSubjects: false,
        manageCourses: false,
        assignLecturer: false,
        manageUsers: false,
        viewAdminDashboard: false,
        viewAllCourses: false,  // Only assigned courses
        viewAssignedCourses: true,
        viewGroupsInCourse: true,
        approveLinks: true,   // Approve/Reject GitHub+Jira
        rejectLinks: true,
        viewContributions: true,
        reviewSRS: true,
        approveSRS: true,
        sendAlerts: true,
        submitLinks: false,
        uploadSRS: false,
    },
    STUDENT: {
        manageSemesters: false,
        manageSubjects: false,
        manageCourses: false,
        assignLecturer: false,
        manageUsers: false,
        viewAdminDashboard: false,
        viewAllCourses: false,
        approveLinks: false,
        submitLinks: false,   // Only LEADER can, enforced at group level
        uploadSRS: false,   // Only LEADER can, enforced at group level
        viewOwnCourses: true,
        viewOwnGroup: true,
        viewContributions: true,
        viewSRS: true,
        viewAlerts: true,
    },
};

/** Check if a system role has a given permission */
export function hasPermission(role, action) {
    return !!ROLES[role]?.[action];
}

/* ═══════════════════════════════════════════════════════════
   GROUP-LEVEL LEADER CHECKS  (Student scope)
   Leader is NOT a system role — derived from group.teamLeaderId
═══════════════════════════════════════════════════════════ */

/** Whether the given userId is the Leader of the group */
export function isGroupLeader(group, userId) {
    return group?.teamLeaderId === userId;
}

/**
 * Guard function for Leader-only actions.
 * Returns null if authorized, or an error message string if not.
 */
export function requireLeader(group, userId) {
    if (!group) return "Không tìm thấy nhóm.";
    if (!isGroupLeader(group, userId)) return "Chỉ Team Leader mới được thực hiện thao tác này.";
    return null;
}

/* ═══════════════════════════════════════════════════════════
   STATUS TOKEN MAPS  — single source of truth for colors
═══════════════════════════════════════════════════════════ */

/** GitHub / Jira link approval status */
export const LINK_STATUS = {
    APPROVED: {
        cls: "bg-green-50 text-green-700 border-green-100",
        label: "Đã duyệt",
        dot: "bg-green-500",
    },
    REJECTED: {
        cls: "bg-red-50 text-red-700 border-red-100",
        label: "Bị từ chối",
        dot: "bg-red-500",
    },
    PENDING: {
        cls: "bg-orange-50 text-orange-700 border-orange-100",
        label: "Chờ duyệt",
        dot: "bg-orange-400",
    },
    NONE: {
        cls: "bg-gray-100 text-gray-500 border-gray-200",
        label: "Chưa liên kết",
        dot: "bg-gray-400",
    },
};

/** SRS Report status */
export const SRS_STATUS = {
    FINAL: {
        cls: "bg-green-50 text-green-700 border-green-100",
        label: "Final",
    },
    REVIEW: {
        cls: "bg-blue-50 text-blue-700 border-blue-100",
        label: "Review",
    },
    DRAFT: {
        cls: "bg-gray-100 text-gray-500 border-gray-200",
        label: "Draft",
    },
};

/** Semester / Course active status */
export const ACTIVE_STATUS = {
    ACTIVE: {
        cls: "bg-green-50 text-green-700 border-green-100",
        label: "Active",
    },
    COMPLETED: {
        cls: "bg-gray-100 text-gray-500 border-gray-200",
        label: "Hoàn thành",
    },
    UPCOMING: {
        cls: "bg-blue-50 text-blue-700 border-blue-100",
        label: "Sắp diễn ra",
    },
    INACTIVE: {
        cls: "bg-gray-100 text-gray-400 border-gray-200",
        label: "Không hoạt động",
    },
};

/** Alert severity */
export const ALERT_SEVERITY = {
    high: {
        cls: "bg-red-50 text-red-700 border-red-100",
        badge: "bg-red-100 text-red-700",
        dot: "bg-red-500",
        label: "Nghiêm trọng",
    },
    medium: {
        cls: "bg-orange-50 text-orange-600 border-orange-100",
        badge: "bg-orange-100 text-orange-700",
        dot: "bg-orange-400",
        label: "Trung bình",
    },
    low: {
        cls: "bg-yellow-50 text-yellow-700 border-yellow-100",
        badge: "bg-yellow-100 text-yellow-700",
        dot: "bg-yellow-400",
        label: "Nhẹ",
    },
};

/* ═══════════════════════════════════════════════════════════
   HELPER FUNCTIONS
═══════════════════════════════════════════════════════════ */

/**
 * Derive the combined link status for a group based on
 * individual GitHub and Jira statuses.
 */
export function getGroupLinkStatus(group) {
    if (!group) return "NONE";
    const { githubStatus, jiraStatus, githubRepoUrl, jiraProjectUrl } = group;
    if (!githubRepoUrl && !jiraProjectUrl) return "NONE";
    if (githubStatus === "APPROVED" && jiraStatus === "APPROVED") return "APPROVED";
    if (githubStatus === "REJECTED" || jiraStatus === "REJECTED") return "REJECTED";
    return "PENDING";
}

/**
 * Build personal alert list for a student based on their groups.
 * Returns array of { type, msg, sev }
 */
export function buildStudentAlerts(groups, userId) {
    const alerts = [];
    for (const g of groups) {
        if (!g.studentIds?.includes(userId)) continue;
        const label = g.name;
        if (!g.githubRepoUrl)
            alerts.push({ type: "warning", msg: `[${label}] Chưa liên kết GitHub repo`, sev: "high" });
        if (!g.jiraProjectUrl)
            alerts.push({ type: "warning", msg: `[${label}] Chưa liên kết Jira project`, sev: "high" });
        if (g.githubRepoUrl && g.githubStatus === "PENDING")
            alerts.push({ type: "info", msg: `[${label}] GitHub link đang chờ giảng viên phê duyệt`, sev: "medium" });
        if (g.jiraProjectUrl && g.jiraStatus === "PENDING")
            alerts.push({ type: "info", msg: `[${label}] Jira link đang chờ giảng viên phê duyệt`, sev: "medium" });
        if (g.githubStatus === "REJECTED")
            alerts.push({ type: "error", msg: `[${label}] GitHub link bị từ chối — cần submit lại!`, sev: "high" });
        if (g.jiraStatus === "REJECTED")
            alerts.push({ type: "error", msg: `[${label}] Jira link bị từ chối — cần submit lại!`, sev: "high" });
    }
    return alerts;
}

/**
 * Build lecturer alert list based on inactivity rules for
 * all groups in the lecturer's assigned courses.
 */
export const INACTIVITY_RULES = [
    { id: "no-github-submit", label: "Chưa submit GitHub link", severity: "high", check: (g) => !g.githubRepoUrl },
    { id: "no-jira-submit", label: "Chưa submit Jira link", severity: "high", check: (g) => !g.jiraProjectUrl },
    { id: "github-pending", label: "GitHub chưa được duyệt", severity: "medium", check: (g) => g.githubRepoUrl && g.githubStatus !== "APPROVED" },
    { id: "jira-pending", label: "Jira chưa được duyệt", severity: "medium", check: (g) => g.jiraProjectUrl && g.jiraStatus !== "APPROVED" },
    { id: "no-commits", label: "Nhóm chưa có commit nào", severity: "high", check: (_, c) => c.length === 0 },
    {
        id: "stale-commits",
        label: "Không có commit trong 7 ngày",
        severity: "medium",
        check: (_, commits) => {
            if (commits.length === 0) return false;
            const last = [...commits].sort((a, b) => new Date(b.committedAt) - new Date(a.committedAt))[0];
            return (Date.now() - new Date(last.committedAt).getTime()) / 86400000 > 7;
        },
    },
];
