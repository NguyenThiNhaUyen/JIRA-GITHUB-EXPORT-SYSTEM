using ClosedXML.Excel;
using JiraGithubExportSystem.IntegrationService.Application.Interfaces.Reports;
using JiraGithubExportSystem.Shared.Models;

namespace JiraGithubExportSystem.IntegrationService.Application.Implementations.Reports;

public class ExcelReportGenerator : IExcelReportGenerator
{
    public byte[] GenerateCommitStatisticsReport(string courseName, List<project> projects)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Thống kê Commit");
        worksheet.Cell(1, 1).Value = "Tên dự án";
        worksheet.Cell(1, 2).Value = "Tên sinh viên";
        worksheet.Cell(1, 3).Value = "Mã sinh viên";
        worksheet.Cell(1, 4).Value = "Vai trò";

        int row = 2;
        foreach (var p in projects)
        {
            if (p.team_members != null)
            {
                foreach (var tm in p.team_members)
                {
                    worksheet.Cell(row, 1).Value = p.name;
                    worksheet.Cell(row, 2).Value = tm.student_user?.user?.full_name ?? "";
                    worksheet.Cell(row, 3).Value = tm.student_user?.student_code ?? "";
                    worksheet.Cell(row, 4).Value = tm.team_role ?? "";
                    row++;
                }
            }
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] GenerateTeamRosterReport(project project)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Danh sách nhóm");
        worksheet.Cell(1, 1).Value = "Tên sinh viên";
        worksheet.Cell(1, 2).Value = "Mã sinh viên";
        worksheet.Cell(1, 3).Value = "Vai trò";

        int row = 2;
        if (project.team_members != null)
        {
            foreach (var tm in project.team_members)
            {
                worksheet.Cell(row, 1).Value = tm.student_user?.user?.full_name ?? "";
                worksheet.Cell(row, 2).Value = tm.student_user?.student_code ?? "";
                worksheet.Cell(row, 3).Value = tm.team_role ?? "";
                row++;
            }
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] GenerateActivitySummaryReport(project project, List<dynamic> activityList)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Tổng hợp hoạt động");
        worksheet.Cell(1, 1).Value = "Tên sinh viên";
        worksheet.Cell(1, 2).Value = "Mã sinh viên";
        worksheet.Cell(1, 3).Value = "Số Commit";
        worksheet.Cell(1, 4).Value = "Số Pull Request";
        worksheet.Cell(1, 5).Value = "Số Issue hoàn thành";

        int row = 2;
        if (project.team_members != null)
        {
            foreach (var tm in project.team_members)
            {
                var stat = activityList.FirstOrDefault(a => a.StudentId == tm.student_user_id);
                worksheet.Cell(row, 1).Value = tm.student_user?.user?.full_name ?? "";
                worksheet.Cell(row, 2).Value = tm.student_user?.student_code ?? "";
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
