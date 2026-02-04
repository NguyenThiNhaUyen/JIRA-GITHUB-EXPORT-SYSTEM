using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IReportService
{
    Task<long> GenerateCommitStatisticsReportAsync(long courseId, string format);
    Task<long> GenerateTeamRosterReportAsync(long projectId, string format);
    Task<long> GenerateActivitySummaryReportAsync(long projectId, DateTime startDate, DateTime endDate, string format);
    Task<string?> GetReportFileUrlAsync(long reportExportId);
    Task<List<report_export>> GetUserReportsAsync(long userId);
}




