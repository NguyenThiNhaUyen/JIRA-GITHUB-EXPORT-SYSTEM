using JiraGithubExport.Shared.Contracts.Responses.Analytics;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

/// <summary>
/// Service for cross-cutting analytics like commit trends, heatmaps, and global rankings.
/// </summary>
public interface IAnalyticsService
{
    Task<IntegrationStatsResponse> GetIntegrationStatsAsync();
    Task<List<DailyCommitStat>> GetCommitTrendsAsync(int days = 7);
    Task<List<HeatmapStat>> GetHeatmapAsync(int days = 90);
    Task<List<TeamRankingStat>> GetTeamRankingsAsync(int limit = 4);
    Task<List<TeamWarningStat>> GetInactiveTeamsAsync();
    Task<List<DetailedTeamActivityStat>> GetTeamActivitiesAsync();
    Task<ActivityChartResponse> GetActivityChartAsync();
    Task<TeamAnalyticsResponse> GetTeamAnalyticsAsync();
    Task<List<GroupRadarMetricResponse>> GetGroupRadarMetricsAsync(long courseId);
    Task<CourseContributionResponse> GetCourseContributionsAsync(long courseId);
}
