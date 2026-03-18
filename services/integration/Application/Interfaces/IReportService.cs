using JiraGithubExport.Shared.Contracts.Responses.Reports;
using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IReportService
{
    Task<long> GenerateCommitStatisticsReportAsync(long courseId, string format);
    Task<long> GenerateTeamRosterReportAsync(long projectId, string format);
    Task<long> GenerateTeamRosterForCourseAsync(long courseId, string format);
    Task<long> GenerateActivitySummaryReportAsync(long projectId, DateTime startDate, DateTime endDate, string format);
    Task<long> GenerateSrsReportAsync(long projectId, string format);
    Task<long> GenerateSrsForCourseAsync(long courseId, string format);
    Task<string?> GetReportFileUrlAsync(long reportExportId);
    Task<List<ReportExportResponse>> GetUserReportsAsync(long userId);
}
