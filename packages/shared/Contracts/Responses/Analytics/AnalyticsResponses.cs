using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Contracts.Responses.Analytics;

public class IntegrationStatsResponse
{
    public int RepoConnected { get; set; }
    public int RepoMissing { get; set; }
    public int JiraConnected { get; set; }
    public int SyncErrors { get; set; }
    public int ReportsExported { get; set; }
}

public class DailyCommitStat
{
    public string Day { get; set; } = string.Empty;
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
    public string Team { get; set; } = string.Empty;
    public int Commits { get; set; }
}

public class TeamWarningStat
{
    public string Team { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

public class DetailedTeamActivityStat
{
    public string Team { get; set; } = string.Empty;
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
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
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
