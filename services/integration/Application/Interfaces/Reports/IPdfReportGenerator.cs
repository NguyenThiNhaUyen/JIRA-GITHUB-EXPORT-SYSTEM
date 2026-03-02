using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.IntegrationService.Application.Interfaces.Reports;

public interface IPdfReportGenerator
{
    byte[] GenerateCommitStatisticsPdf(string courseName, List<project> projects);
    byte[] GenerateTeamRosterPdf(project project);
    byte[] GenerateActivitySummaryPdf(project project, List<dynamic> activityList);
    byte[] GenerateSrsReportPdf(project project, List<dynamic> systemFeatures, List<dynamic> nfrs);
}
