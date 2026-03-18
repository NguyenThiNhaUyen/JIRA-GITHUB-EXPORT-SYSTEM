using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.IntegrationService.Application.Interfaces.Reports;

public interface IExcelReportGenerator
{
    byte[] GenerateCommitStatisticsReport(string courseName, List<project> projects);
    byte[] GenerateTeamRosterReport(project project);
    byte[] GenerateActivitySummaryReport(project project, List<dynamic> activityList);
}
