export const mapProject = (project) => {
    if (!project) return null;
    return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        courseId: project.courseId,
        courseName: project.courseName,
        team: (project.members || project.teamMembers || []).map(member => ({
            studentId: member.studentUserId,
            studentName: member.studentName,
            studentCode: member.studentCode,
            role: member.role,
            contributionScore: member.contributionScore
        })),
        integration: project.integration ? {
            githubUrl: project.githubRepoUrl || project.integration.githubUrl,
            jiraUrl: project.jiraProjectUrl || project.integration.jiraUrl,
            githubStatus: project.integration.githubStatus,
            jiraStatus: project.integration.jiraStatus,
            lastSyncAt: project.integration.lastSyncAt
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
        totalCommits: metrics.totalCommits || 0,
        totalIssues: metrics.totalIssues || 0,
        myCommits: metrics.userCommits || 0,
        myIssues: metrics.userIssues || 0,
        lastSyncAt: metrics.lastSyncAt,
        contributions: (metrics.memberContributions || []).map(m => ({
            studentId: m.studentUserId,
            commits: m.commitsCount || 0,
            issues: m.issuesCount || 0
        }))
    };
};

