using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IAdminService
{
    Task<AdminStatsResponse> GetAdminStatsAsync();
    Task BulkAssignAsync(BulkAssignRequest request);
    Task<List<AuditLogResponse>> GetRecentAuditLogsAsync(int count = 10);
}
