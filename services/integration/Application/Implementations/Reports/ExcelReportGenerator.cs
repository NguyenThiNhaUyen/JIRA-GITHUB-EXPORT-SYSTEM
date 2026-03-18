using ClosedXML.Excel;
using JiraGithubExport.IntegrationService.Application.Interfaces.Reports;
using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.IntegrationService.Application.Implementations.Reports;

public class ExcelReportGenerator : IExcelReportGenerator
{
    public byte[] GenerateCommitStatisticsReport(string courseName, List<Project> projects)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Commit Statistics");
        worksheet.Cell(1, 1).Value = "Project Name";
        worksheet.Cell(1, 2).Value = "Student Name";
        worksheet.Cell(1, 3).Value = "Student Code";
        worksheet.Cell(1, 4).Value = "Role";

        int row = 2;
        foreach (var p in projects)
        {
            if (p.TeamMembers != null)
            {
                foreach (var tm in p.TeamMembers)
                {
                    worksheet.Cell(row, 1).Value = p.Name;
                    worksheet.Cell(row, 2).Value = tm.StudentUser?.User?.FullName ?? "";
                    worksheet.Cell(row, 3).Value = tm.StudentUser?.StudentCode ?? "";
                    worksheet.Cell(row, 4).Value = tm.TeamRole ?? "";
                    row++;
                }
            }
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] GenerateTeamRosterReport(Project Project)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Team Roster");
        worksheet.Cell(1, 1).Value = "Student Name";
        worksheet.Cell(1, 2).Value = "Student Code";
        worksheet.Cell(1, 3).Value = "Role";

        int row = 2;
        if (Project.TeamMembers != null)
        {
            foreach (var tm in Project.TeamMembers)
            {
                worksheet.Cell(row, 1).Value = tm.StudentUser?.User?.FullName ?? "";
                worksheet.Cell(row, 2).Value = tm.StudentUser?.StudentCode ?? "";
                worksheet.Cell(row, 3).Value = tm.TeamRole ?? "";
                row++;
            }
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] GenerateActivitySummaryReport(Project Project, List<dynamic> activityList)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Activity Summary");
        worksheet.Cell(1, 1).Value = "Student Name";
        worksheet.Cell(1, 2).Value = "Student Code";
        worksheet.Cell(1, 3).Value = "Commits";
        worksheet.Cell(1, 4).Value = "Pull Requests";
        worksheet.Cell(1, 5).Value = "Issues Completed";

        int row = 2;
        if (Project.TeamMembers != null)
        {
            foreach (var tm in Project.TeamMembers)
            {
                var stat = activityList.FirstOrDefault(a => a.StudentId == tm.StudentUserId);
                worksheet.Cell(row, 1).Value = tm.StudentUser?.User?.FullName ?? "";
                worksheet.Cell(row, 2).Value = tm.StudentUser?.StudentCode ?? "";
                worksheet.Cell(row, 3).Value = (int)(stat?.Commits ?? 0);
                worksheet.Cell(row, 4).Value = (int)(stat?.PRs ?? 0);
                worksheet.Cell(row, 5).Value = (int)(stat?.Issues ?? 0);
                row++;
            }
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
