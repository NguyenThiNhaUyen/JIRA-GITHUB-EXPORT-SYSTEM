using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.IntegrationService.Application.Interfaces.Reports;

public interface IExcelReportGenerator
{
    byte[] GenerateCommitStatisticsReport(string courseName, List<Project> projects);
    byte[] GenerateTeamRosterReport(Project project);
    byte[] GenerateActivitySummaryReport(Project project, List<dynamic> activityList);
}

