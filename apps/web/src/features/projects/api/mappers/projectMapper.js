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
            // BE ProjectDetailResponse: UserId, FullName, StudentCode, TeamRole
            studentId: String(member.userId || member.UserId || member.studentUserId || member.user_id || ""),
            studentName: member.fullName || member.FullName || member.studentName || member.full_name || "",
            studentCode: member.studentCode || member.StudentCode || member.student_code || "",
            role: member.teamRole || member.TeamRole || member.role || member.team_role || "MEMBER",
            participationStatus: member.participationStatus || member.ParticipationStatus || member.participation_status || "ACTIVE",
            contributionScore: member.contributionScore || member.ContributionScore || member.contribution_score || 0
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
        totalCommits: metrics.totalCommits || metrics.TotalCommits || 0,
        totalIssues: metrics.totalIssues || metrics.TotalIssues || 0,
        // BE ProjectDashboardResponse fields — fallback to multiple spellings
        myCommits: metrics.myCommits || metrics.userCommits || metrics.MyCommits || 0,
        myIssues: metrics.myIssues || metrics.userIssues || metrics.MyIssues || 0,
        lastSyncAt: metrics.lastSyncAt || metrics.LastSyncAt || null,
        // MemberContributionSummary: StudentCode, FullName, Commits, PullRequests, IssuesCompleted
        contributions: (metrics.memberContributions || metrics.MemberContributions || metrics.contributions || []).map(m => ({
            studentId: m.studentUserId || m.userId || m.UserId || m.StudentCode || "",
            studentName: m.fullName || m.FullName || m.studentName || "",
            commits: m.commits || m.Commits || m.commitsCount || 0,
            pullRequests: m.pullRequests || m.PullRequests || 0,
            issues: m.issuesCompleted || m.IssuesCompleted || m.issuesCount || m.issues || 0
        }))
    };
};
