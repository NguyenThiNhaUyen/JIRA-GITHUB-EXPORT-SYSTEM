using JiraGithubExport.IntegrationService.Application.Interfaces.Reports;
using JiraGithubExport.Shared.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace JiraGithubExport.IntegrationService.Application.Implementations.Reports;

public class PdfReportGenerator : IPdfReportGenerator
{
    // ─────────────────────────────────────────────────────────
    // DESIGN TOKENS (PREMIUM NAVY)
    // ─────────────────────────────────────────────────────────
    private static readonly string PrimaryColor   = "#0F2B46";   // Deep Premium Navy
    private static readonly string AccentColor    = "#1D4ED8";   // Trust Blue
    private static readonly string TableHeader    = "#1E3A8A";   // Deep Blue header
    private static readonly string TableRowAlt    = "#F8FAFC";   // Ultra-light slate
    private static readonly string TextGray       = "#475569";   // Slate 600
    private static readonly string BorderGray     = "#E2E8F0";   // Slate 200

    public byte[] GenerateCommitStatisticsPdf(string courseName, List<project> projects)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.Header().Text($"Commit Statistics – {courseName}").SemiBold().FontSize(20).FontColor(PrimaryColor);
                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(c => { c.RelativeColumn(2); c.RelativeColumn(3); c.RelativeColumn(2); c.RelativeColumn(2); });
                    table.Header(h => {
                        foreach (var col in new[] { "Project Name", "Student Full Name", "Student Code", "Role" })
                            h.Cell().Background(TableHeader).Padding(6).Text(col).FontColor(Colors.White).SemiBold().FontSize(10);
                    });
                    bool alt = false;
                    foreach (var p in projects) {
                        foreach (var tm in p.team_members ?? new List<team_member>()) {
                            string bg = alt ? TableRowAlt : Colors.White;
                            table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(p.name).FontSize(9);
                            table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(tm.student_user?.user?.full_name ?? "").FontSize(9);
                            table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(tm.student_user?.student_code ?? "").FontSize(9);
                            table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(tm.team_role ?? "").FontSize(9);
                            alt = !alt;
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
                page.Header().Text($"Team Roster – {project.name}").SemiBold().FontSize(20).FontColor(PrimaryColor);
                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(c => { c.RelativeColumn(3); c.RelativeColumn(2); c.RelativeColumn(2); });
                    table.Header(h => {
                        foreach (var col in new[] { "Student Full Name", "Student Code", "Team Role" })
                            h.Cell().Background(TableHeader).Padding(6).Text(col).FontColor(Colors.White).SemiBold().FontSize(10);
                    });
                    bool alt = false;
                    foreach (var tm in project.team_members ?? new List<team_member>()) {
                        string bg = alt ? TableRowAlt : Colors.White;
                        table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(tm.student_user?.user?.full_name ?? "").FontSize(9);
                        table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(tm.student_user?.student_code ?? "").FontSize(9);
                        table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(tm.team_role ?? "").FontSize(9);
                        alt = !alt;
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
                page.Header().Text($"Activity Summary – {project.name}").SemiBold().FontSize(20).FontColor(PrimaryColor);
                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(c => { c.RelativeColumn(3); c.RelativeColumn(2); c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); });
                    table.Header(h => {
                        foreach (var col in new[] { "Student Name", "Code", "Commits", "PRs", "Issues" })
                            h.Cell().Background(TableHeader).Padding(6).Text(col).FontColor(Colors.White).SemiBold().FontSize(10);
                    });
                    bool alt = false;
                    foreach (var tm in project.team_members ?? new List<team_member>()) {
                        var stat = activityList.FirstOrDefault(a => a.StudentId == tm.student_user_id);
                        string bg = alt ? TableRowAlt : Colors.White;
                        table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(tm.student_user?.user?.full_name ?? "").FontSize(9);
                        table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(tm.student_user?.student_code ?? "").FontSize(9);
                        table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(((int)(stat?.Commits ?? 0)).ToString()).FontSize(9).AlignCenter();
                        table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(((int)(stat?.PRs ?? 0)).ToString()).FontSize(9).AlignCenter();
                        table.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(((int)(stat?.Issues ?? 0)).ToString()).FontSize(9).AlignCenter();
                        alt = !alt;
                    }
                });
            });
        }).GeneratePdf();
    }

    // ─────────────────────────────────────────────────────────
    // DEDICATED ISO/IEEE 29148 SRS REPORT
    // ─────────────────────────────────────────────────────────
    public byte[] GenerateSrsReportPdf(SrsReportData data)
    {
        return Document.Create(container =>
        {
            // ── COVER PAGE ──
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0);

                page.Content().Column(col =>
                {
                    col.Item().Background(PrimaryColor).Height(120).AlignBottom().Padding(30).Text("JIRA-GITHUB REPORTING SYSTEM")
                        .Bold().FontSize(12).FontColor(Colors.White).LetterSpacing(0.2f);

                    col.Item().PaddingHorizontal(40).PaddingTop(80).Text("SOFTWARE REQUIREMENTS SPECIFICATION")
                        .Bold().FontSize(32).FontColor(PrimaryColor);
                    
                    col.Item().PaddingHorizontal(40).PaddingTop(10).Text("ISO/IEC/IEEE 29148:2018 Compliant")
                        .FontSize(14).FontColor(AccentColor).LetterSpacing(0.1f);

                    col.Item().PaddingHorizontal(40).PaddingTop(80).Row(row => {
                        row.ConstantItem(5).Background(AccentColor).Height(60);
                        row.RelativeItem().PaddingLeft(20).Column(inner => {
                            inner.Item().Text(data.Project.name).Bold().FontSize(24).FontColor(Colors.Black);
                            inner.Item().Text($"Course: {data.Project.course?.course_name ?? "N/A"}").FontSize(14).FontColor(TextGray);
                        });
                    });

                    col.Item().PaddingHorizontal(40).PaddingTop(60).Table(t =>
                    {
                        t.ColumnsDefinition(c => { c.ConstantColumn(120); c.RelativeColumn(); });
                        void InfoRow(string label, string value)
                        {
                            t.Cell().PaddingVertical(8).BorderBottom(1).BorderColor(BorderGray).Text(label).FontSize(11).FontColor(TextGray);
                            t.Cell().PaddingVertical(8).BorderBottom(1).BorderColor(BorderGray).Text(value).Bold().FontSize(11).FontColor(Colors.Black);
                        }
                        InfoRow("Jira Project Key", data.JiraProjectKey);
                        InfoRow("GitHub Repository", data.GithubRepoUrl);
                        InfoRow("Generation Date", data.GeneratedAt.ToString("dd MMMM yyyy HH:mm UTC"));
                        InfoRow("Document Version", "1.0 - Generated");
                    });
                });
            });

            // ── MAIN CONTENT PAGES ──
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2.5f, Unit.Centimetre);

                page.Header().Column(col =>
                {
                    col.Item().PaddingBottom(10).Row(row =>
                    {
                        row.RelativeItem().Text($"SRS: {data.Project.name}").SemiBold().FontSize(9).FontColor(PrimaryColor);
                        row.ConstantItem(100).AlignRight().Text($"ISO 29148").FontSize(9).FontColor(TextGray);
                    });
                    col.Item().BorderBottom(1).BorderColor(PrimaryColor);
                });

                page.Footer().Column(col => {
                    col.Item().BorderTop(1).BorderColor(BorderGray).PaddingTop(10).Row(row => {
                        row.RelativeItem().Text("System Generated Document").FontSize(8).FontColor(TextGray);
                        row.ConstantItem(80).AlignRight().Text(txt =>
                        {
                            txt.Span("Page ").FontSize(8).FontColor(TextGray);
                            txt.CurrentPageNumber().FontSize(8).FontColor(TextGray);
                            txt.Span(" of ").FontSize(8).FontColor(TextGray);
                            txt.TotalPages().FontSize(8).FontColor(TextGray);
                        });
                    });
                });

                page.Content().PaddingTop(20).Column(doc =>
                {
                    // ───────────────────────────────────────────────
                    // 1. INTRODUCTION
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "1. Introduction");

                    SubSection(doc, "1.1 Purpose");
                    doc.Item().PaddingLeft(10).Text(
                        "This Software Requirements Specification (SRS) document describes the functional and " +
                        "non-functional requirements for the system. It ensures transparency between student " +
                        "development activities and evaluation criteria by synchronizing live Jira and GitHub data.").FontSize(10).FontColor(TextGray).LineHeight(1.5f);

                    SubSection(doc, "1.2 Project Scope");
                    doc.Item().PaddingLeft(10).Text(
                        $"The system is the '{data.Project.name}' software project. It integrates with " +
                        $"Jira ({data.JiraSiteUrl}) for issue tracking and GitHub ({data.GithubRepoUrl}) " +
                        "for source code management.").FontSize(10).FontColor(TextGray).LineHeight(1.5f);

                    SubSection(doc, "1.3 Terminology");
                    doc.Item().PaddingLeft(10).Table(t =>
                    {
                        t.ColumnsDefinition(c => { c.ConstantColumn(80); c.RelativeColumn(); });
                        t.Header(h => {
                            h.Cell().Background(TableHeader).Padding(4).Text("Term").FontColor(Colors.White).SemiBold().FontSize(9);
                            h.Cell().Background(TableHeader).Padding(4).Text("Definition").FontColor(Colors.White).SemiBold().FontSize(9);
                        });
                        var terms = new[] { ("FR", "Functional Requirement"), ("NFR", "Non-Functional Requirement"), ("PR", "Pull Request (GitHub)") };
                        bool alt = false;
                        foreach (var (term, def) in terms) {
                            string bg = alt ? TableRowAlt : Colors.White;
                            t.Cell().Background(bg).Padding(4).Text(term).SemiBold().FontSize(9);
                            t.Cell().Background(bg).Padding(4).Text(def).FontSize(9);
                            alt = !alt;
                        }
                    });

                    // ───────────────────────────────────────────────
                    // 2. TEAM OVERVIEW
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "2. Team Composition & Activity Base");
                    
                    doc.Item().PaddingLeft(10).Table(t => {
                        t.ColumnsDefinition(c => { c.RelativeColumn(3); c.ConstantColumn(80); c.ConstantColumn(80); c.ConstantColumn(80); });
                        t.Header(h => {
                            h.Cell().Background(TableHeader).Padding(4).Text("Member Profile").FontColor(Colors.White).SemiBold().FontSize(9);
                            h.Cell().Background(TableHeader).Padding(4).Text("Jira Status").FontColor(Colors.White).SemiBold().FontSize(9).AlignCenter();
                            h.Cell().Background(TableHeader).Padding(4).Text("Commits").FontColor(Colors.White).SemiBold().FontSize(9).AlignCenter();
                            h.Cell().Background(TableHeader).Padding(4).Text("PRs").FontColor(Colors.White).SemiBold().FontSize(9).AlignCenter();
                        });
                        bool alt = false;
                        foreach(var m in (data.TeamMembers.Count > 0 ? data.TeamMembers : new List<string> { "No members found" })) {
                            string bg = alt ? TableRowAlt : Colors.White;
                            t.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(m).FontSize(9);
                            t.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text("Linked").FontColor(Colors.Green.Darken2).FontSize(9).AlignCenter();
                            t.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(data.GithubTotalCommits.ToString()).FontSize(9).AlignCenter();
                            t.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(data.GithubTotalPRs.ToString()).FontSize(9).AlignCenter();
                            alt = !alt;
                        }
                    });

                    // ───────────────────────────────────────────────
                    // 3. SYSTEM FEATURES (FRs)
                    // ───────────────────────────────────────────────
                    doc.Item().PageBreak(); // Epics and stories start on a fresh page
                    SectionHeader(doc, "3. System Features (Functional Requirements)");
                    doc.Item().PaddingBottom(10).Text("The functional requirements below are synchronized directly from Jira Epics and Stories.")
                        .FontSize(9).FontColor(TextGray).Italic();

                    if (data.SystemFeatures.Count == 0)
                    {
                        doc.Item().PaddingTop(10).Text("No Epics or Stories found.").FontSize(10).FontColor(TextGray).Italic();
                    }

                    int featIndex = 1;
                    foreach (var feat in data.SystemFeatures)
                    {
                        doc.Item().PaddingTop(15).Decoration(decor => {
                            decor.Before().Background(AccentColor).Padding(6).Row(row => {
                                row.RelativeItem().Text($"3.{featIndex} {feat.IssueKey}: {feat.Title}").Bold().FontSize(11).FontColor(Colors.White);
                                row.ConstantItem(80).Text(feat.Status ?? "N/A").Bold().FontSize(9).FontColor(Colors.White).AlignRight();
                            });
                            decor.Content().BorderLeft(2).BorderRight(2).BorderBottom(2).BorderColor(AccentColor).Padding(10).Column(fc => {
                                fc.Item().Text("Description:").SemiBold().FontSize(9).FontColor(PrimaryColor);
                                fc.Item().PaddingTop(2).Text(string.IsNullOrWhiteSpace(feat.Description) ? "No description provided." : feat.Description).FontSize(9).FontColor(TextGray).LineHeight(1.4f);
                                
                                if (feat.SubTasks.Count > 0)
                                {
                                    fc.Item().PaddingTop(10).Text("Breakdown (Tasks / Sub-tasks):").SemiBold().FontSize(9).FontColor(PrimaryColor);
                                    fc.Item().PaddingTop(4).Table(t => {
                                        t.ColumnsDefinition(c => { c.ConstantColumn(80); c.RelativeColumn(); c.ConstantColumn(60); c.ConstantColumn(70); });
                                        t.Header(h => {
                                            h.Cell().Background(TableRowAlt).BorderBottom(1).BorderColor(BorderGray).Padding(4).Text("Task Key").SemiBold().FontSize(8);
                                            h.Cell().Background(TableRowAlt).BorderBottom(1).BorderColor(BorderGray).Padding(4).Text("Summary").SemiBold().FontSize(8);
                                            h.Cell().Background(TableRowAlt).BorderBottom(1).BorderColor(BorderGray).Padding(4).Text("Priority").SemiBold().FontSize(8);
                                            h.Cell().Background(TableRowAlt).BorderBottom(1).BorderColor(BorderGray).Padding(4).Text("Status").SemiBold().FontSize(8).AlignRight();
                                        });
                                        foreach(var sub in feat.SubTasks) {
                                            t.Cell().BorderBottom(1).BorderColor(BorderGray).Padding(4).Text(sub.IssueKey).FontSize(8).FontColor(PrimaryColor);
                                            t.Cell().BorderBottom(1).BorderColor(BorderGray).Padding(4).Text(sub.Title).FontSize(8);
                                            t.Cell().BorderBottom(1).BorderColor(BorderGray).Padding(4).Text(sub.Priority ?? "N/A").FontSize(8);
                                            t.Cell().BorderBottom(1).BorderColor(BorderGray).Padding(4).Text(sub.Status ?? "N/A").FontSize(8).AlignRight();
                                        }
                                    });
                                }
                            });
                        });
                        featIndex++;
                    }

                    // ───────────────────────────────────────────────
                    // 4. NON-FUNCTIONAL REQUIREMENTS
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "4. Non-Functional Requirements");
                    SubSection(doc, "4.1 System NFRs");
                    IssueTable(doc, data.NonFunctionalRequirements.Count > 0 ? data.NonFunctionalRequirements : DefaultNfrs());

                    // ───────────────────────────────────────────────
                    // 5. PROJECT SIGN-OFF
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "5. Document Sign-Off");
                    doc.Item().PaddingTop(10).Table(t => {
                        t.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); });
                        t.Cell().Padding(10).Column(c => {
                            c.Item().Text("Student Leader").SemiBold().FontSize(9).FontColor(PrimaryColor);
                            c.Item().PaddingTop(40).BorderBottom(1).BorderColor(BorderGray);
                            c.Item().PaddingTop(5).Text("Signature / Date").FontSize(8).FontColor(TextGray);
                        });
                        t.Cell().Padding(10).Column(c => {
                            c.Item().Text("Reviewing Lecturer").SemiBold().FontSize(9).FontColor(PrimaryColor);
                            c.Item().PaddingTop(40).BorderBottom(1).BorderColor(BorderGray);
                            c.Item().PaddingTop(5).Text("Signature / Date").FontSize(8).FontColor(TextGray);
                        });
                        t.Cell().Padding(10).Column(c => {
                            c.Item().Text("System Administrator").SemiBold().FontSize(9).FontColor(PrimaryColor);
                            c.Item().PaddingTop(40).BorderBottom(1).BorderColor(BorderGray);
                            c.Item().PaddingTop(5).Text("System Validated").FontSize(8).FontColor(TextGray);
                        });
                    });
                });
            });
        }).GeneratePdf();
    }

    // ─────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────
    private static void SectionHeader(ColumnDescriptor doc, string title)
    {
        doc.Item().PaddingTop(25).PaddingBottom(10).Text(title).Bold().FontSize(16).FontColor(PrimaryColor);
    }

    private static void SubSection(ColumnDescriptor doc, string title)
    {
        doc.Item().PaddingTop(12).PaddingBottom(4).Text(title).SemiBold().FontSize(11).FontColor(AccentColor);
    }

    private static void IssueTable(ColumnDescriptor doc, List<SrsIssueRow> rows)
    {
        doc.Item().PaddingLeft(10).Table(t =>
        {
            t.ColumnsDefinition(c => { c.ConstantColumn(90); c.RelativeColumn(3); c.ConstantColumn(70); c.ConstantColumn(70); });
            t.Header(h => {
                foreach (var col in new[] { "Issue Key", "Description", "Priority", "Status" })
                    h.Cell().Background(TableHeader).Padding(6).Text(col).FontColor(Colors.White).SemiBold().FontSize(9);
            });
            bool alt = false;
            foreach (var row in rows) {
                string bg = alt ? TableRowAlt : Colors.White;
                t.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(row.IssueKey).FontSize(9).FontColor(PrimaryColor);
                t.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(row.Title).FontSize(9);
                t.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(row.Priority ?? "N/A").FontSize(9);
                t.Cell().Background(bg).BorderBottom(1).BorderColor(BorderGray).Padding(6).Text(row.Status ?? "N/A").FontSize(9);
                alt = !alt;
            }
        });
    }

    private static List<SrsIssueRow> DefaultNfrs() => new List<SrsIssueRow>
    {
        new SrsIssueRow { IssueKey = "NFR-01", Title = "System must synchronize Jira tasks securely over SSL", Status = "ACTIVE", Priority = "High" },
        new SrsIssueRow { IssueKey = "NFR-02", Title = "GitHub Webhook response time must be under 500ms", Status = "ACTIVE", Priority = "Medium" },
        new SrsIssueRow { IssueKey = "NFR-03", Title = "Report generation should not block UI thread", Status = "ACTIVE", Priority = "High" }
    };
}
