namespace JiraGithubExport.Shared.Contracts.Responses.Analytics;

/// <summary>
/// GET /analytics/student/stats — Student personal dashboard stats
/// </summary>
public class StudentDashboardStatsResponse
{
    public int TotalProjects { get; set; }
    public int TotalCommits { get; set; }
    public int TotalPullRequests { get; set; }
    public double ContributionPercent { get; set; } // Personal contribution ratio
    public int JiraTasksAssigned { get; set; }
    public int JiraTasksDone { get; set; }
    public List<StudentProjectInfo> Projects { get; set; } = new();
}

public class StudentProjectInfo
{
    public long ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public string Role { get; set; } = "MEMBER";
    public int CommitCount { get; set; }
    public int CompletionPercent { get; set; }
    public DateTime? LastActivity { get; set; }
}

/// <summary>
/// GET /student/deadlines — Student deadlines from Jira
/// </summary>
public class StudentDeadlineResponse
{
    public string Title { get; set; } = string.Empty;
    public string? Due { get; set; }
    public string Project { get; set; } = string.Empty;
    public string Status { get; set; } = "TO DO";
    public string? Priority { get; set; }
    public string? IssueKey { get; set; }
}

/// <summary>
/// GET /lecturer/activity-logs — Lecturer-scoped activity logs
/// </summary>
public class LecturerActivityLogResponse
{
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public string? ProjectName { get; set; }
    public DateTime Timestamp { get; set; }
}
