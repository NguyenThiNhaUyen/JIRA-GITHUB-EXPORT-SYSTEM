export const mapProject = (project) => {
    if (!project) return null;
    return {
        id: String(project.id || project.Id || ""),
        name: project.name || project.Name || "",
        description: project.description || project.Description || "",
        status: project.status || project.Status || "ACTIVE",
        courseId: project.courseId || project.CourseId || null,
        courseName: project.course_name || project.courseName || project.CourseName || "",
        team: (project.members || project.teamMembers || project.team || []).map(member => ({
            studentId: String(member.studentUserId || member.user_id || member.Id || ""),
            studentName: member.studentName || member.full_name || member.FullName || "",
            studentCode: member.studentCode || member.student_code || member.StudentCode || "",
            role: member.role || member.team_role || "MEMBER",
            participationStatus: member.participationStatus || member.participation_status || "ACTIVE",
            contributionScore: member.contributionScore || member.contribution_score || 0
        })),
        integration: project.integration ? {
            githubUrl: project.githubRepoUrl || project.github_repo_url || project.integration.githubUrl || "",
            jiraUrl: project.jiraProjectUrl || project.jira_project_url || project.integration.jiraUrl || "",
            githubStatus: project.integration.githubStatus || project.integration_status || "PENDING",
            jiraStatus: project.integration.jiraStatus || project.integration_status || "PENDING",
            lastSyncAt: project.integration.lastSyncAt || project.integration.last_sync_at || null
        } : {
            githubUrl: project.github_repo_url || "",
            jiraUrl: project.jira_project_url || "",
            status: project.integration_status || "PENDING",
            lastSyncAt: null
        },
        createdAt: project.createdAt || project.created_at || null,
        updatedAt: project.updatedAt || project.updated_at || null
    };
};

export const mapProjectList = (beData) => {
    if (!beData) return { items: [], totalCount: 0, page: 1, pageSize: 0 };

    // PagedResponse shape: { results: [] or items: [], totalCount, page, pageSize }
    if (beData.results !== undefined || beData.Results !== undefined || beData.items !== undefined || beData.Items !== undefined) {
        const results = beData.items ?? beData.Items ?? beData.results ?? beData.Results ?? [];
        return {
            items: results.map(mapProject),
            totalCount: beData.totalCount ?? beData.TotalCount ?? results.length,
            page: beData.page ?? beData.Page ?? 1,
            pageSize: beData.pageSize ?? beData.PageSize ?? results.length,
        };
    }

    if (Array.isArray(beData)) {
        return {
            items: beData.map(mapProject),
            totalCount: beData.length,
            page: 1,
            pageSize: beData.length,
        };
    }

    return { items: [], totalCount: 0, page: 1, pageSize: 0 };
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
