namespace JiraGithubExport.Shared.Contracts.Responses.Reports;

public class CommitStatistics
{
    public string StudentCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int TotalCommits { get; set; }
    public List<DayCommitCount> DailyCommits { get; set; } = new();
}

public class DayCommitCount
{
    public DateOnly Date { get; set; }
    public int Count { get; set; }
}

public class TeamRoster
{
    public string ProjectName { get; set; } = string.Empty;
    public string Leader { get; set; } = string.Empty;
    public List<TeamMemberSummary> Members { get; set; } = new();
}

public class TeamMemberSummary
{
    public string StudentCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class ActivitySummary
{
    public string ProjectName { get; set; } = string.Empty;
    public int CommitsCount { get; set; }
    public int PullRequestsCount { get; set; }
    public int JiraIssuesCount { get; set; }
    public List<MemberContributionSummary> MemberContributions { get; set; } = new();
}

public class MemberContributionSummary
{
    public string StudentCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int Commits { get; set; }
    public int PullRequests { get; set; }
    public int IssuesCompleted { get; set; }
}
public class ReportExportResponse
{
    public long Id { get; set; }
    public string Type { get; set; } = string.Empty; // From report_type
    public string Format { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public DateTime CreatedAt { get; set; } // From requested_at
    public string? ErrorMessage { get; set; }
}

