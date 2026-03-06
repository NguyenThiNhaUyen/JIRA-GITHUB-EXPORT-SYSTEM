export const mapProject = (project) => {
    if (!project) return null;
    return {
        id: project.id || project.Id,
        name: project.name || project.Name || "",
        description: project.description || project.Description || "",
        status: project.status || project.Status || "ACTIVE",
        courseId: project.course_id || project.courseId || project.CourseId || "",
        courseName: project.course_name || project.courseName || project.CourseName || "",
        team: (project.members || project.teamMembers || []).map(member => ({
            studentId: member.user_id || member.studentUserId,
            studentName: member.full_name || member.studentName,
            studentCode: member.student_code || member.studentCode,
            role: member.team_role || member.role,
            participationStatus: member.participation_status || "ACTIVE",
            contributionScore: member.contribution_score || member.contributionScore || 100
        })),
        integration: {
            githubUrl: project.github_repo_url || project.integration?.githubUrl,
            jiraUrl: project.jira_project_url || project.integration?.jiraUrl,
            status: project.integration_status || project.integration?.status || "PENDING",
            lastSyncAt: project.integration?.lastSyncAt
        },
        createdAt: project.created_at || project.createdAt,
        updatedAt: project.updated_at || project.updatedAt
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

