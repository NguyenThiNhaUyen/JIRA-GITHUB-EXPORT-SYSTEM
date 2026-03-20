namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class ProjectDetailResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public long CourseId { get; set; }
    public string CourseName { get; set; } = null!;
    public string CourseCode { get; set; } = string.Empty;
    public int TeamCount { get; set; }
    public List<TeamMemberInfo> TeamMembers { get; set; } = new();
    public List<TeamMemberInfo> Members 
    { 
        get => TeamMembers; 
        set => TeamMembers = value; 
    }
    public string? GithubRepoUrl { get; set; }
    public string? JiraProjectUrl { get; set; }
    public string? GithubStatus { get; set; }
    public string? JiraStatus { get; set; }
    public IntegrationInfo? Integration { get; set; }
    public int CommitCount { get; set; }
    public int Commits              // alias for CommitCount
    { 
        get => CommitCount; 
        set => CommitCount = value; 
    }
    public int IssueCount { get; set; }
    public int IssuesDone { get; set; }
    public int OpenIssues { get; set; }
    public int PrsMerged { get; set; }
    public int TeamSize { get; set; }
    public int SrsVersions { get; set; }
    public int SprintCompletion { get; set; }
    public int MyContribution { get; set; }
    public string? LastCommit { get; set; }
    public DateTime? LastActivity { get; set; }
    public int ProgressPercent { get; set; }
    public int RiskScore { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string IntegrationStatus => GithubStatus ?? "NONE";
}

public class TeamMemberInfo
{
    public long StudentUserId { get; set; }
    public string StudentCode { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string StudentName 
    { 
        get => FullName; 
        set => FullName = value; 
    }
    public string TeamRole { get; set; } = null!;
    public string Role 
    { 
        get => TeamRole; 
        set => TeamRole = value; 
    }
    public string ParticipationStatus { get; set; } = null!;
    public string? Responsibility { get; set; }
    public DateTime? JoinedAt { get; set; }
    public int ContributionScore { get; set; }
}

public class IntegrationInfo
{
    public string? GithubUrl { get; set; }
    public string? JiraUrl { get; set; }
    public string GithubStatus { get; set; } = "PENDING";
    public string JiraStatus { get; set; } = "PENDING";
    // Detailed HEAD properties
    public string? GithubRepoUrl 
    { 
        get => GithubUrl; 
        set => GithubUrl = value; 
    }
    public string? GithubRepoOwner { get; set; }
    public string? GithubRepoName { get; set; }
    public string? JiraProjectKey { get; set; }
    public string? JiraSiteUrl 
    { 
        get => JiraUrl; 
        set => JiraUrl = value; 
    }
    public string ApprovalStatus { get; set; } = "PENDING";
    public long? SubmittedByUserId { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public long? ApprovedByUserId { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectedReason { get; set; }
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
    // Flat helpers for FE
    public int TotalCommits => GitHubStats?.TotalCommits ?? 0;
    public int TotalIssues => JiraStats?.TotalIssues ?? 0;
    public int UserCommits { get; set; }
    public int UserIssues { get; set; }
    public DateTime? LastSyncAt { get; set; }
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
    public long StudentUserId { get; set; }
    public string StudentCode { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public int Commits30d { get; set; }
    public int CommitsCount => Commits30d;
    public int PullRequests30d { get; set; }
    public int JiraIssuesCompleted30d { get; set; }
    public int IssuesCount => JiraIssuesCompleted30d;
    public DateTime? LastActivityDate { get; set; }
    public int InactiveDays { get; set; }
    public string? Alert { get; set; }
}

public class KanbanBoardResponse
{
    public KanbanColumns Columns { get; set; } = new();
}

public class KanbanColumns
{
    public List<KanbanTask> Todo { get; set; } = new();
    public List<KanbanTask> In_Progress { get; set; } = new();
    public List<KanbanTask> Done { get; set; } = new();
}

public class KanbanTask
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? Assignee { get; set; }
    public string? Priority { get; set; }
    public string? Type { get; set; }
    public string? StoryPoint { get; set; }
}

public class CfdBoardResponse
{
    public List<CfdBucket> Buckets { get; set; } = new();
}

public class CfdBucket
{
    public string Date { get; set; } = null!;
    public int Todo { get; set; }
    public int InProgress { get; set; }
    public int Done { get; set; }
}

public class RoadmapResponse
{
    public List<RoadmapItem> Items { get; set; } = new();
}

public class RoadmapItem
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime? DueDate { get; set; }
    public string? Assignee { get; set; }
}

public class AgingWipResponse
{
    public List<AgingWipItem> Items { get; set; } = new();
}

public class AgingWipItem
{
    public string IssueId { get; set; } = null!;
    public string Key { get; set; } = null!;
    public string Summary { get; set; } = null!;
    public int DaysInProgress { get; set; }
    public string? Assignee { get; set; }
}
