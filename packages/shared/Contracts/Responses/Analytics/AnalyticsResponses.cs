using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Contracts.Responses.Analytics;

public class AdminStatsResponse
{
    public int Semesters { get; set; }
    public int Subjects { get; set; }
    public int Courses { get; set; }
    public int Lecturers { get; set; }
    public int Students { get; set; }
    public int Projects { get; set; }
}

public class IntegrationStatsResponse
{
    public int RepoConnected { get; set; }
    public int RepoMissing { get; set; }
    public int JiraConnected { get; set; }
    public int SyncErrors { get; set; }
    public int ReportsExported { get; set; }
    public SrsStatusSummary SrsStatus { get; set; } = new();
}

public class SrsStatusSummary
{
    public int Draft { get; set; }
    public int Review { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
}

public class DailyCommitStat
{
    public string Day { get; set; } = string.Empty;  // Can be "Mon" or date string "09/03"
    public int Commits { get; set; }
}

public class HeatmapStat
{
    public string Date { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class ActivityChartResponse
{
    public List<DailyCommitStat> CommitChart { get; set; } = new();
    public List<HeatmapStat> ContributionHeatmap { get; set; } = new();
}

public class TeamRankingStat
{
    public long TeamId { get; set; }
    public string Team { get; set; } = string.Empty;      // FE expects "team" field
    public string TeamName { get; set; } = string.Empty; // Kept for backward compat
    public int Commits { get; set; }
    public int Rank { get; set; }
}

public class TeamWarningStat
{
    public string Team { get; set; } = string.Empty;      // FE expects "team"
    public string TeamName { get; set; } = string.Empty; // backward compat
    public string Reason { get; set; } = string.Empty;
    public string? LastActivity { get; set; }             // FE expects lastActivity (YYYY-MM-DD or null)
}

public class DetailedTeamActivityStat
{
    public long TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public bool RepoStatus { get; set; }
    public int TotalCommits { get; set; }
    public DateTime? LastCommitTime { get; set; }
    public string Status { get; set; } = "ACTIVE"; // "ACTIVE", "LOW", "MISSING_REPO"
}

public class TeamAnalyticsResponse
{
    public List<TeamRankingStat> TopRanking { get; set; } = new();
    public List<TeamWarningStat> InactiveWarning { get; set; } = new();
    public List<DetailedTeamActivityStat> DetailedActivity { get; set; } = new();
}

public class AuditLogResponse
{
    public string Type { get; set; } = "info";   // info/success/warning/error
    public string Message { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;  // FE expects time: "5 phút trước"
    public DateTime Timestamp { get; set; }
}

public class GroupRadarMetricResponse
{
    public string GroupName { get; set; } = string.Empty;
    public int Commits { get; set; }
    public int SrsDone { get; set; }
    public int TeamSize { get; set; }
    public int GithubLinked { get; set; }
    public int JiraLinked { get; set; }
}

public class LecturerWorkloadResponse
{
    public int CourseCount { get; set; }
    public int StudentCount { get; set; }
}

public class CourseContributionStudentResponse
{
    public long StudentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public long GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public int Commits { get; set; }
    public int JiraDone { get; set; }
    public int Prs { get; set; }
    public int Reviews { get; set; }
    public int ActiveDays { get; set; }
    public int OverdueTasks { get; set; }
    public int LastActiveDaysAgo { get; set; }
    public decimal Score { get; set; }
    public string Status { get; set; } = "Cần chú ý";
    public List<int> DailyActivity { get; set; } = new();
}

public class CourseContributionResponse
{
    public List<CourseContributionStudentResponse> Students { get; set; } = new();
    public List<int> WeeklyCommits { get; set; } = new();
    public List<int> WeeklyJira { get; set; } = new();
}
