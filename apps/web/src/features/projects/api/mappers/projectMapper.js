export const mapProject = (project) => {
    if (!project) return null;
    return {
        id: String(project.id || ""),
        name: project.name || "",
        description: project.description || "",
        status: project.status || "ACTIVE",
        courseName: project.course_name || "",
        team: (project.members || []).map(member => ({
            studentId: String(member.user_id || ""),
            studentName: member.full_name || "",
            studentCode: member.student_code || "",
            role: member.team_role || "MEMBER",
            participationStatus: member.participation_status || "ACTIVE",
            contributionScore: member.contribution_score || 0
        })),
        integration: {
            githubUrl: project.github_repo_url || "",
            jiraUrl: project.jira_project_url || "",
            status: project.integration_status || "PENDING",
            lastSyncAt: project.integration?.last_sync_at || null
        },
        createdAt: project.created_at || null,
        updatedAt: project.updated_at || null
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

