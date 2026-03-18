export const mapProject = (project) => {
    if (!project) return null;
    
    // BE can return members as Team, Members, or TeamMembers
    const rawMembers = project.members || project.teamMembers || project.team || project.Team || [];
    
    return {
        id: String(project.id || project.Id || ""),
        name: project.name || project.Name || "",
        description: project.description || project.Description || "",
        status: project.status || project.Status || "ACTIVE",
        courseId: project.courseId || project.CourseId || null,
        courseName: project.courseName || project.CourseName || project.course_name || "",
        courseCode: project.courseCode || project.CourseCode || "",
        
        team: rawMembers.map(member => ({
            studentId: String(member.studentUserId || member.userId || member.user_id || member.Id || member.id || ""),
            studentName: member.studentName || member.fullName || member.full_name || member.FullName || "",
            studentCode: member.studentCode || member.student_code || member.StudentCode || "",
            role: member.role || member.teamRole || member.team_role || "MEMBER",
            participationStatus: member.participationStatus || member.participation_status || "ACTIVE",
            contributionScore: member.contributionScore || member.contribution_score || 0
        })),
        
        topic: project.topic || project.description || "",
        
        integration: project.integration ? {
            githubUrl: project.integration.githubUrl || project.githubRepoUrl || project.github_repo_url || "",
            jiraUrl: project.integration.jiraUrl || project.jiraProjectUrl || project.jira_project_url || "",
            githubStatus: project.integration.githubStatus || project.githubStatus || "PENDING",
            jiraStatus: project.integration.jiraStatus || project.jiraStatus || "PENDING",
            lastSyncAt: project.integration.lastSyncAt || null
        } : {
            githubUrl: project.githubRepoUrl || project.github_repo_url || "",
            jiraUrl: project.jiraProjectUrl || project.jira_project_url || "",
            githubStatus: project.githubStatus || "NONE",
            jiraStatus: project.jiraStatus || "NONE",
            lastSyncAt: null
        },
        
        // Stats aliases
        commits: project.commitsCount || project.commits || project.commitCount || 0,
        issues: project.issueCount || project.issues || 0,
        issuesDone: project.issuesDone || 0,
        
        createdAt: project.createdAt || project.created_at || null,
        updatedAt: project.updatedAt || project.updated_at || null
    };
};

export const mapProjectList = (beData) => {
    if (!beData) return { items: [], totalCount: 0, page: 1, pageSize: 0 };

    if (beData.items !== undefined || beData.Items !== undefined || beData.results !== undefined || beData.Results !== undefined) {
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
    
    // metrics is ProjectDashboardResponse: { project, teamSummary, gitHubStats, jiraStats, memberContributions }
    const gh = metrics.gitHubStats || metrics.githubStats || {};
    const jr = metrics.jiraStats || metrics.jiraStats || {};
    const mems = metrics.memberContributions || [];

    return {
        totalCommits: gh.totalCommits || 0,
        totalIssues: jr.totalIssues || 0,
        issuesInProgress: jr.inProgress || 0,
        issuesDone: jr.done || 0,
        
        // Fallback for parts using flat structure
        lastSyncAt: gh.lastCommitDate || jr.lastUpdate || null,
        
        contributions: mems.map(m => ({
            studentId: m.studentUserId || m.studentCode || "", // Backend often sends Code as ID in analytics
            studentCode: m.studentCode || "",
            studentName: m.fullName || "",
            commits: m.commits30d || m.commitsCount || 0,
            issues: m.jiraIssuesCompleted30d || m.issuesCount || 0,
            lastActivity: m.lastActivityDate || null
        }))
    };
};

