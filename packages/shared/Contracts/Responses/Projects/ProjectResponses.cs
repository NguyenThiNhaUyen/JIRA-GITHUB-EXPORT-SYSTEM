using System.Text.Json.Serialization;

namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class ProjectDetailResponse
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = null!;

    [JsonPropertyName("course_name")]
    public string CourseName { get; set; } = null!;

    [JsonPropertyName("github_repo_url")]
    public string? GithubRepoUrl { get; set; }

    [JsonPropertyName("jira_project_url")]
    public string? JiraProjectUrl { get; set; }

    [JsonPropertyName("integration_status")]
    public string? IntegrationStatus { get; set; }

    [JsonPropertyName("members")]
    public List<TeamMemberInfo> TeamMembers { get; set; } = new();
}

public class TeamMemberInfo
{
    [JsonPropertyName("user_id")]
    public long StudentUserId { get; set; }

    [JsonPropertyName("student_code")]
    public string StudentCode { get; set; } = null!;

    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = null!;

    [JsonPropertyName("team_role")]
    public string TeamRole { get; set; } = null!;

    [JsonPropertyName("participation_status")]
    public string ParticipationStatus { get; set; } = null!;

    [JsonPropertyName("contribution_score")]
    public int ContributionScore { get; set; }
}

public class IntegrationInfo
{
    [JsonPropertyName("github_repo_url")]
    public string? GithubRepoUrl { get; set; }
    
    [JsonPropertyName("jira_url")]
    public string? JiraSiteUrl { get; set; }
    
    [JsonPropertyName("status")]
    public string ApprovalStatus { get; set; } = "PENDING";
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







