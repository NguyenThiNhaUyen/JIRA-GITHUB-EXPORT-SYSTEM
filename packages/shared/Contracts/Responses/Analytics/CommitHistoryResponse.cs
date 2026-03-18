namespace JiraGithubExport.Shared.Contracts.Responses.Analytics;

/// <summary>
/// GET /api/projects/{id}/commit-history â€” per-student contribution chart
/// Matches FE contributions.jsx expected contract exactly
/// </summary>
public class StudentCommitHistoryResponse
{
    public long StudentId { get; set; }         // FE uses studentId (long)
    public long StudentUserId { get; set; }     // alias (long)
    public string StudentName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int TotalCommits { get; set; }       // FE uses totalCommits
    public int Commits { get; set; }            // alias
    public int LinesAdded { get; set; }
    public int LinesDeleted { get; set; }
    public int PullRequests { get; set; }
    public double ContributionPercent { get; set; }
    public List<int> WeeklyCommits { get; set; } = new(); // [3, 5, 2, 8, 6, 4, 2, ...]
    public List<HeatmapStat> HeatmapData { get; set; } = new();
    public DateTime? LastCommitAt { get; set; }
}
