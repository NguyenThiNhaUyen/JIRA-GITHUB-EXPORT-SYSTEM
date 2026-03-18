namespace JiraGithubExport.Shared.Contracts.Responses.Analytics;

/// <summary>GET /api/analytics/student/stats</summary>
public class StudentDashboardStatsResponse
{
    public int TotalProjects { get; set; }
    public int TotalCommits { get; set; }
    public int WeeklyCommits { get; set; }      // FE expects weeklyCommits
    public int TotalPullRequests { get; set; }
    public int TotalPrs { get; set; }           // FE alias totalPrs
    public int TotalIssues { get; set; }        // FE expects totalIssues
    public int JiraTasksAssigned { get; set; }
    public int JiraTasksDone { get; set; }
    public double ContributionPercent { get; set; }
    public List<StudentProjectInfo> Projects { get; set; } = new();
}

public class StudentProjectInfo
{
    public long ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public string CourseCode { get; set; } = string.Empty;
    public string Role { get; set; } = "MEMBER";
    public int CommitCount { get; set; }
    public int Commits { get; set; }             // alias
    public int IssuesDone { get; set; }
    public int OpenIssues { get; set; }
    public int PrsMerged { get; set; }
    public int TeamSize { get; set; }
    public int CompletionPercent { get; set; }
    public int SprintCompletion { get; set; }    // alias
    public int MyContribution { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public int SrsVersions { get; set; }
    public string? LastCommit { get; set; }      // relative string e.g. "2 giá» trÆ°á»›c"
    public DateTime? LastActivity { get; set; }
}

/// <summary>GET /api/analytics/student/deadlines</summary>
public class StudentDeadlineResponse
{
    public string Id { get; set; } = string.Empty; // FE expects id field
    public string Title { get; set; } = string.Empty;
    public string Project { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty; // FE alias
    public string? DueDate { get; set; }           // ISO 8601 for absolute date
    public string? Due { get; set; }               // Human-readable e.g. "NgĂ y mai - 09:00"
    public int DaysLeft { get; set; }
    public string Severity { get; set; } = "low"; // high/medium/low
    public string Status { get; set; } = "TO DO";
    public string? Priority { get; set; }
    public string? IssueKey { get; set; }
}

/// <summary>GET /api/analytics/lecturer/activity-logs</summary>
public class LecturerActivityLogResponse
{
    public string Type { get; set; } = string.Empty;     // github/jira/info/warning
    public string Message { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;     // FE expects time: "5 phĂºt trÆ°á»›c"
    public string CourseName { get; set; } = string.Empty;
    public string? ProjectName { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>GET /api/analytics/activity-log (Admin)</summary>
public class AdminActivityLogResponse
{
    public string Message { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;     // relative time
    public string Type { get; set; } = "info";           // info/success/warning/error
    public DateTime Timestamp { get; set; }
}

/// <summary>GET /api/analytics/student/me/commit-activity</summary>
public class DailyLabeledCommitStat
{
    public string Label { get; set; } = string.Empty; // T2, T3... or Mon, Tue...
    public int Commits { get; set; }
}
