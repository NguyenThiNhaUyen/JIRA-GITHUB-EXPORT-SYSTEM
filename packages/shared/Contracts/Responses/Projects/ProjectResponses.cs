namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class ProjectDetailResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public long CourseId { get; set; }
    public string CourseName { get; set; } = null!;
<<<<<<< HEAD
    public int TeamCount { get; set; }
    public List<TeamMemberInfo> TeamMembers { get; set; } = new();
    public IntegrationInfo? Integration { get; set; }
=======
    public string CourseCode { get; set; } = string.Empty;  // e.g. "SWD392-SE1831"
    public string? GithubRepoUrl { get; set; }
    public string? JiraProjectUrl { get; set; }
    public string? GithubStatus { get; set; }
    public string? JiraStatus { get; set; }
    public IntegrationInfo? Integration { get; set; }
    public List<TeamMemberInfo> Members { get; set; } = new();
    public int CommitCount { get; set; }
    public int Commits { get; set; }              // alias for CommitCount
    public int IssueCount { get; set; }
    public int IssuesDone { get; set; }           // done issues count
    public int OpenIssues { get; set; }           // open issues count
    public int PrsMerged { get; set; }            // merged pull requests count
    public int TeamSize { get; set; }             // number of active members
    public int SrsVersions { get; set; }          // SRS docs submitted
    public int SprintCompletion { get; set; }     // alias for ProgressPercent
    public int MyContribution { get; set; }       // current user contribution %
    public string? LastCommit { get; set; }       // relative string: "2 giờ trước"
    public DateTime? LastActivity { get; set; }
    public int ProgressPercent { get; set; }
    public int RiskScore { get; set; }
>>>>>>> origin
}

public class TeamMemberInfo
{
<<<<<<< HEAD
    public long StudentUserId { get; set; }
    public string StudentCode { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string TeamRole { get; set; } = null!;
    public string ParticipationStatus { get; set; } = null!;
    public string? Responsibility { get; set; }
    public DateTime? JoinedAt { get; set; }
=======
    public long StudentUserId { get; set; } // Changed from StudentId to match FE
    public string StudentCode { get; set; } = null!;
    public string StudentName { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string ParticipationStatus { get; set; } = null!;
    public int ContributionScore { get; set; }
>>>>>>> origin
}

public class IntegrationInfo
{
<<<<<<< HEAD
    public string? GithubRepoUrl { get; set; }
    public string? GithubRepoOwner { get; set; }
    public string? GithubRepoName { get; set; }
    public string? JiraProjectKey { get; set; }
    public string? JiraSiteUrl { get; set; }
    // Approval workflow
    public string ApprovalStatus { get; set; } = "PENDING";
    public long? SubmittedByUserId { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public long? ApprovedByUserId { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectedReason { get; set; }
=======
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
>>>>>>> origin
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
<<<<<<< HEAD







=======
>>>>>>> origin
