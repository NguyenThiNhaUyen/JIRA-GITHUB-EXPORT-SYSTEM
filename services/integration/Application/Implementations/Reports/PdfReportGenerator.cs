using JiraGithubExport.IntegrationService.Application.Interfaces.Reports;
using JiraGithubExport.Shared.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace JiraGithubExport.IntegrationService.Application.Implementations.Reports;

public class PdfReportGenerator : IPdfReportGenerator
{
    public byte[] GenerateCommitStatisticsPdf(string courseName, List<project> projects)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.Header().Text($"Commit Statistics - {courseName}").SemiBold().FontSize(20);

                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("Project");
                        header.Cell().Text("Student Name");
                        header.Cell().Text("Student Code");
                        header.Cell().Text("Role");
                    });

                    foreach (var p in projects)
                    {
                        if (p.team_members != null)
                        {
                            foreach (var tm in p.team_members)
                            {
                                table.Cell().Text(p.name);
                                table.Cell().Text(tm.student_user?.user?.full_name ?? "");
                                table.Cell().Text(tm.student_user?.student_code ?? "");
                                table.Cell().Text(tm.team_role ?? "");
                            }
                        }
                    }
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateTeamRosterPdf(project project)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.Header().Text($"Team Roster - {project.name}").SemiBold().FontSize(20);

                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("Student Name");
                        header.Cell().Text("Student Code");
                        header.Cell().Text("Role");
                    });

                    if (project.team_members != null)
                    {
                        foreach (var tm in project.team_members)
                        {
                            table.Cell().Text(tm.student_user?.user?.full_name ?? "");
                            table.Cell().Text(tm.student_user?.student_code ?? "");
                            table.Cell().Text(tm.team_role ?? "");
                        }
                    }
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateActivitySummaryPdf(project project, List<dynamic> activityList)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.Header().Text($"Activity Summary - {project.name}").SemiBold().FontSize(20);

                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("Student Name");
                        header.Cell().Text("Student Code");
                        header.Cell().Text("Commits");
                        header.Cell().Text("Pull Requests");
                        header.Cell().Text("Issues");
                    });

                    if (project.team_members != null)
                    {
                        foreach (var tm in project.team_members)
                        {
                            var stat = activityList.FirstOrDefault(a => a.StudentId == tm.student_user_id);
                            table.Cell().Text(tm.student_user?.user?.full_name ?? "");
                            table.Cell().Text(tm.student_user?.student_code ?? "");
                            table.Cell().Text(((int)(stat?.Commits ?? 0)).ToString());
                            table.Cell().Text(((int)(stat?.PRs ?? 0)).ToString());
                            table.Cell().Text(((int)(stat?.Issues ?? 0)).ToString());
                        }
                    }
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateSrsReportPdf(project project, List<dynamic> systemFeatures, List<dynamic> nfrs)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.Header().Text($"Software Requirements Specification (SRS) - {project.name}").SemiBold().FontSize(20);

                page.Content().Column(col =>
                {
                    col.Item().PaddingTop(10).Text("3. System Features").Bold().FontSize(16);
                    foreach (var feat in systemFeatures)
                    {
                        col.Item().PaddingTop(5).Text($"[{feat.jira_issue_key}] {feat.title}").SemiBold().FontSize(12);
                        col.Item().Text((string)(feat.description ?? "No description.")).FontSize(10);
                    }

                    col.Item().PaddingTop(15).Text("5. Nonfunctional Requirements").Bold().FontSize(16);
                    foreach (var nfr in nfrs)
                    {
                        col.Item().PaddingTop(5).Text($"[{nfr.jira_issue_key}] {nfr.title}").SemiBold().FontSize(12);
                        col.Item().Text((string)(nfr.description ?? "No description.")).FontSize(10);
                    }
                });
            });
        }).GeneratePdf();
    }
}
