namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class ProjectDetailResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public long CourseId { get; set; }
    public string CourseName { get; set; } = null!;
    public int TeamCount { get; set; }
    public List<TeamMemberInfo> TeamMembers { get; set; } = new();
    public IntegrationInfo? Integration { get; set; }
}

public class TeamMemberInfo
{
    public long StudentUserId { get; set; }
    public string StudentCode { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string TeamRole { get; set; } = null!;
    public string ParticipationStatus { get; set; } = null!;
    public string? Responsibility { get; set; }
    public DateTime? JoinedAt { get; set; }
}

public class IntegrationInfo
{
    public string? GithubRepoUrl { get; set; }
    public string? GithubRepoOwner { get; set; }
    public string? GithubRepoName { get; set; }
    public string? JiraProjectKey { get; set; }
    public string? JiraSiteUrl { get; set; }
}

public class ProjectDashboardResponse
{
    public ProjectSummary Project { get; set; } = null!;
    public TeamSummary TeamSummary { get; set; } = null!;
    public GitHubStats? GitHubStats { get; set; }
    public JiraStats? JiraStats { get; set; }
    public List<MemberContribution> MemberContributions { get; set; } = new();
}

public class ProjectSummary
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string Status { get; set; } = null!;
}

public class TeamSummary
{
    public int TotalMembers { get; set; }
    public int ActiveMembers { get; set; }
    public string? Leader { get; set; }
}

public class GitHubStats
{
    public int TotalCommits { get; set; }
    public int TotalPullRequests { get; set; }
    public DateTime? LastCommitDate { get; set; }
    public int InactiveDays { get; set; }
}

public class JiraStats
{
    public int TotalIssues { get; set; }
    public int InProgress { get; set; }
    public int Done { get; set; }
    public DateTime? LastUpdate { get; set; }
}

public class MemberContribution
{
    public string StudentCode { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public int Commits30d { get; set; }
    public int PullRequests30d { get; set; }
    public int JiraIssuesCompleted30d { get; set; }
    public DateTime? LastActivityDate { get; set; }
    public int InactiveDays { get; set; }
    public string? Alert { get; set; }
}







