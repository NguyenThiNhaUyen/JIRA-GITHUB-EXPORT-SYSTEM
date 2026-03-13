using System.Collections.Generic;
using System.Threading.Tasks;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IAnalyticsService
{
    Task<IntegrationStatsResponse> GetIntegrationStatsAsync();
    Task<ActivityChartResponse> GetActivityChartAsync();
    Task<TeamAnalyticsResponse> GetTeamAnalyticsAsync();
    Task<List<AuditLogResponse>> GetRecentAuditLogsAsync(int count = 10);
    Task<List<GroupRadarMetricResponse>> GetGroupRadarMetricsAsync(long courseId);
    Task<List<JiraGithubExport.Shared.Contracts.Responses.Courses.LecturerCourseStatResponse>> GetLecturerCoursesStatsAsync(long lecturerId);
    Task<List<JiraGithubExport.Shared.Contracts.Responses.Notifications.NotificationResponse>> GetRecentNotificationsAsync(long userId);
}
