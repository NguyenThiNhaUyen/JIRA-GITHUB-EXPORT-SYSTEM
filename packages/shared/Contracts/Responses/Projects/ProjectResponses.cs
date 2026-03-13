namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class ProjectDetailResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public long CourseId { get; set; }
    public string CourseName { get; set; } = null!;
    public string? GithubRepoUrl { get; set; }
    public string? JiraProjectUrl { get; set; }
    public string? GithubStatus { get; set; }
    public string? JiraStatus { get; set; }
    public IntegrationInfo? Integration { get; set; }
    public List<TeamMemberInfo> Members { get; set; } = new();
    public int CommitCount { get; set; }
    public int IssueCount { get; set; }
    public DateTime? LastActivity { get; set; }
}

public class TeamMemberInfo
{
    public long StudentId { get; set; }
    public string StudentCode { get; set; } = null!;
    public string StudentName { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string ParticipationStatus { get; set; } = null!;
    public int ContributionScore { get; set; }
}

public class IntegrationInfo
{
    public string? GithubUrl { get; set; }
    public string? JiraUrl { get; set; }
    public string GithubStatus { get; set; } = "PENDING";
    public string JiraStatus { get; set; } = "PENDING";
}

public class CommitResponse
{
    public long Id { get; set; }
    public string Sha { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string? AuthorName { get; set; }
    public string? AuthorStudentCode { get; set; }
    public DateTime? CommittedAt { get; set; }
    public int Additions { get; set; }
    public int Deletions { get; set; }
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
