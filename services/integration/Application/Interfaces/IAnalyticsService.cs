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
}
