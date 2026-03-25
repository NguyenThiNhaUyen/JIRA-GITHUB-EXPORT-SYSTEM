export const mapProject = (project) => {
    if (!project) return null;
    return {
        id: project.id ?? project.Id,
        name: project.name ?? project.Name ?? "",
        description: project.description ?? project.Description ?? "",
        status: project.status ?? project.Status ?? "ACTIVE",
        // BE có thể trả courseId dưới nhiều key (camel/pascal/snake) hoặc nested course object
        courseId: project.courseId
            ?? project.CourseId
            ?? project.course_id
            ?? project.Course_Id
            ?? project.course?.id
            ?? project.course?.courseId,
        courseName: project.courseName ?? project.CourseName ?? "",
        courseCode: project.courseCode ?? project.CourseCode ?? "",
        // Stats
        commitCount: project.commitCount ?? project.CommitCount ?? project.commits ?? project.Commits ?? 0,
        issueCount: project.issueCount ?? project.IssueCount ?? 0,
        issuesDone: project.issuesDone ?? project.IssuesDone ?? 0,
        openIssues: project.openIssues ?? project.OpenIssues ?? 0,
        prsMerged: project.prsMerged ?? project.PrsMerged ?? 0,
        teamSize: project.teamSize ?? project.TeamSize ?? 0,
        srsVersions: project.srsVersions ?? project.SrsVersions ?? 0,
        progressPercent: project.progressPercent ?? project.ProgressPercent ?? 0,
        riskScore: project.riskScore ?? project.RiskScore ?? 0,
        myContribution: project.myContribution ?? project.MyContribution ?? 0,
        lastCommit: project.lastCommit ?? project.LastCommit ?? null,
        lastActivity: project.lastActivity ?? project.LastActivity ?? null,
        // Team
        team: (project.teamMembers ?? project.TeamMembers ?? project.members ?? project.Members ?? project.team ?? []).map(member => ({
            studentUserId: member.studentUserId ?? member.StudentUserId ?? member.studentId,
            studentId: member.studentUserId ?? member.StudentUserId ?? member.studentId,
            studentName: member.fullName ?? member.FullName ?? member.studentName ?? "",
            studentCode: member.studentCode ?? member.StudentCode ?? "",
            role: member.teamRole ?? member.TeamRole ?? member.role ?? member.Role ?? "MEMBER",
            teamRole: member.teamRole ?? member.TeamRole ?? member.role ?? "MEMBER",
            participationStatus: member.participationStatus ?? member.ParticipationStatus ?? "ACTIVE",
            responsibility: member.responsibility ?? member.Responsibility ?? "",
            joinedAt: member.joinedAt ?? member.JoinedAt ?? null,
            contributionScore: member.contributionScore ?? member.ContributionScore ?? 0,
        })),
        // Integration — BE has separate githubStatus / jiraStatus + approvalStatus
        githubStatus: project.githubStatus ?? project.GithubStatus ?? project.integration?.githubStatus ?? "NONE",
        jiraStatus: project.jiraStatus ?? project.JiraStatus ?? project.integration?.jiraStatus ?? "NONE",
        integrationStatus: project.integrationStatus ?? project.IntegrationStatus ?? "NONE",
        integration: project.integration ? {
            githubRepoUrl: project.integration.githubRepoUrl ?? project.integration.GithubRepoUrl ?? project.integration.githubUrl ?? null,
            githubRepoOwner: project.integration.githubRepoOwner ?? project.integration.GithubRepoOwner ?? null,
            githubRepoName: project.integration.githubRepoName ?? project.integration.GithubRepoName ?? null,
            jiraProjectKey: project.integration.jiraProjectKey ?? project.integration.JiraProjectKey ?? null,
            jiraSiteUrl: project.integration.jiraSiteUrl ?? project.integration.JiraSiteUrl ?? project.integration.jiraUrl ?? null,
            githubStatus: project.integration.githubStatus ?? project.integration.GithubStatus ?? "NONE",
            jiraStatus: project.integration.jiraStatus ?? project.integration.JiraStatus ?? "NONE",
            approvalStatus: project.integration.approvalStatus ?? project.integration.ApprovalStatus ?? "PENDING",
            submittedAt: project.integration.submittedAt ?? project.integration.SubmittedAt ?? null,
            approvedAt: project.integration.approvedAt ?? project.integration.ApprovedAt ?? null,
            approvedByName: project.integration.approvedByName ?? project.integration.ApprovedByName ?? null,
            rejectedReason: project.integration.rejectedReason ?? project.integration.RejectedReason ?? null,
        } : null,
        createdAt: project.createdAt ?? project.CreatedAt ?? null,
        updatedAt: project.updatedAt ?? project.UpdatedAt ?? null
    };
};

export const mapProjectList = (pagedResponse) => {
    if (!pagedResponse) return { items: [], totalCount: 0, page: 1, pageSize: 0 };
    
    // Support both camelCase and PascalCase
    const list = pagedResponse.items ?? pagedResponse.Items ?? [];
    
    return {
        items: list.map(mapProject),
        totalCount: pagedResponse.totalCount ?? pagedResponse.TotalCount ?? list.length,
        page: pagedResponse.page ?? pagedResponse.Page ?? 1,
        pageSize: pagedResponse.pageSize ?? pagedResponse.PageSize ?? list.length
    };
};

export const mapProjectMetrics = (metrics) => {
    if (!metrics) return null;
    return {
        project: metrics.project ?? metrics.Project ?? null,
        teamSummary: metrics.teamSummary ?? metrics.TeamSummary ?? null,
        githubStats: metrics.githubStats ?? metrics.GitHubStats ?? metrics.gitHubStats ?? null,
        jiraStats: metrics.jiraStats ?? metrics.JiraStats ?? null,
        totalCommits: metrics.totalCommits ?? metrics.TotalCommits ?? 0,
        totalIssues: metrics.totalIssues ?? metrics.TotalIssues ?? 0,
        userCommits: metrics.userCommits ?? metrics.UserCommits ?? 0,
        userIssues: metrics.userIssues ?? metrics.UserIssues ?? 0,
        lastSyncAt: metrics.lastSyncAt ?? metrics.LastSyncAt ?? null,
        contributions: (metrics.memberContributions ?? metrics.MemberContributions ?? []).map(m => ({
            studentUserId: m.studentUserId ?? m.StudentUserId,
            studentCode: m.studentCode ?? m.StudentCode ?? "",
            fullName: m.fullName ?? m.FullName ?? "",
            commits: m.commits30d ?? m.Commits30d ?? m.commitsCount ?? m.CommitsCount ?? 0,
            pullRequests: m.pullRequests30d ?? m.PullRequests30d ?? 0,
            issues: m.jiraIssuesCompleted30d ?? m.JiraIssuesCompleted30d ?? m.issuesCount ?? m.IssuesCount ?? 0,
            lastActivity: m.lastActivityDate ?? m.LastActivityDate ?? null,
            inactiveDays: m.inactiveDays ?? m.InactiveDays ?? 0,
            alert: m.alert ?? m.Alert ?? null
        })),
        weeklyCommits: metrics.weeklyCommits ?? metrics.WeeklyCommits ?? []
    };
};
