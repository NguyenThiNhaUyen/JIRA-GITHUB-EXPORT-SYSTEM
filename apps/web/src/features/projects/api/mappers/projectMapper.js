export const mapProject = (project) => {
    if (!project) return null;
    return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        courseId: project.courseId,
        courseName: project.courseName,
        team: (project.teamMembers || []).map(member => ({
            studentUserId: member.studentUserId,
            studentId: member.studentUserId,
            studentName: member.fullName,
            studentCode: member.studentCode,
            role: member.teamRole,
            teamRole: member.teamRole,
            participationStatus: member.participationStatus,
            responsibility: member.responsibility,
            joinedAt: member.joinedAt
        })),
        integration: project.integration ? {
            githubRepoUrl: project.integration.githubRepoUrl,
            githubRepoOwner: project.integration.githubRepoOwner,
            githubRepoName: project.integration.githubRepoName,
            jiraProjectKey: project.integration.jiraProjectKey,
            jiraSiteUrl: project.integration.jiraSiteUrl,
            approvalStatus: project.integration.approvalStatus,
            githubStatus: project.integration.approvalStatus,
            jiraStatus: project.integration.approvalStatus,
            submittedAt: project.integration.submittedAt,
            approvedAt: project.integration.approvedAt
        } : null,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
    };
};

export const mapProjectList = (pagedResponse) => {
    if (!pagedResponse) return { items: [], totalCount: 0 };
    return {
        items: (pagedResponse.items || []).map(mapProject),
        totalCount: pagedResponse.totalCount,
        page: pagedResponse.page,
        pageSize: pagedResponse.pageSize
    };
};

export const mapProjectMetrics = (metrics) => {
    if (!metrics) return null;
    return {
        project: metrics.project,
        teamSummary: metrics.teamSummary,
        githubStats: metrics.githubStats,
        jiraStats: metrics.jiraStats,
        contributions: (metrics.memberContributions || []).map(m => ({
            studentCode: m.studentCode,
            fullName: m.fullName,
            commits: m.commits30d || 0,
            pullRequests: m.pullRequests30d || 0,
            issues: m.jiraIssuesCompleted30d || 0,
            lastActivity: m.lastActivityDate,
            inactiveDays: m.inactiveDays,
            alert: m.alert
        }))
    };
};

