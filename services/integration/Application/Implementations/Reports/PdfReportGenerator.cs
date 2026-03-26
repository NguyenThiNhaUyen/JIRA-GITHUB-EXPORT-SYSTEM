using System.Linq;
using JiraGithubExport.IntegrationService.Application.Interfaces.Reports;
using JiraGithubExport.Shared.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace JiraGithubExport.IntegrationService.Application.Implementations.Reports;

public class PdfReportGenerator : IPdfReportGenerator
{
    // ─────────────────────────────────────────────────────────
    // DESIGN TOKENS
    // ─────────────────────────────────────────────────────────
    private static readonly string PrimaryColor   = "#1B3A6B";   // dark navy
    private static readonly string AccentColor    = "#2E6DBF";   // medium blue
    private static readonly string TableHeader    = "#2E6DBF";
    private static readonly string TableRowAlt    = "#EEF3FB";
    private static readonly string TextGray       = "#555555";
    private static readonly string BorderGray     = "#CCCCCC";

    // ─────────────────────────────────────────────────────────
    // COMMIT STATISTICS
    // ─────────────────────────────────────────────────────────
    public byte[] GenerateCommitStatisticsPdf(string courseName, List<project> projects, List<dynamic> activityList)
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
                    table.ColumnsDefinition(c =>
                    {
                        c.RelativeColumn();
                        c.RelativeColumn();
                        c.RelativeColumn();
                        c.RelativeColumn();
                        c.RelativeColumn();
                        c.RelativeColumn();
                        c.RelativeColumn();
                    });
                    table.Header(h =>
                    {
                        foreach (var col in new[] { "Project", "Student Name", "Student Code", "Role", "Commits", "PRs", "Issues" })
                            h.Cell().Background(TableHeader).Padding(4).Text(col).FontColor(Colors.White).Bold();
                    });

                    bool alt = false;
                    foreach (var p in projects)
                    {
                        if (p.team_members == null) continue;
                        foreach (var tm in p.team_members)
                        {
                            var stat = activityList.FirstOrDefault(a => a.StudentId == tm.student_user_id);
                            string bg = alt ? TableRowAlt : Colors.White;
                            table.Cell().Background(bg).Padding(4).Text(p.name);
                            table.Cell().Background(bg).Padding(4).Text(tm.student_user?.user?.full_name ?? "");
                            table.Cell().Background(bg).Padding(4).Text(tm.student_user?.student_code ?? "");
                            table.Cell().Background(bg).Padding(4).Text(tm.team_role ?? "");
                            table.Cell().Background(bg).Padding(4).Text(((int)(stat?.Commits ?? 0)).ToString());
                            table.Cell().Background(bg).Padding(4).Text(((int)(stat?.PRs ?? 0)).ToString());
                            table.Cell().Background(bg).Padding(4).Text(((int)(stat?.Issues ?? 0)).ToString());
                            alt = !alt;
                        }
                    }
                });
            });
        }).GeneratePdf();
    }

    // ─────────────────────────────────────────────────────────
    // TEAM ROSTER
    // ─────────────────────────────────────────────────────────
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
                    table.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); });
                    table.Header(h =>
                    {
                        foreach (var col in new[] { "Student Name", "Student Code", "Role" })
                            h.Cell().Background(TableHeader).Padding(4).Text(col).FontColor(Colors.White).Bold();
                    });
                    bool alt = false;
                    if (project.team_members != null)
                    {
                        foreach (var tm in project.team_members)
                        {
                            string bg = alt ? TableRowAlt : Colors.White;
                            table.Cell().Background(bg).Padding(4).Text(tm.student_user?.user?.full_name ?? "");
                            table.Cell().Background(bg).Padding(4).Text(tm.student_user?.student_code ?? "");
                            table.Cell().Background(bg).Padding(4).Text(tm.team_role ?? "");
                            alt = !alt;
                        }
                    }
                });
            });
        }).GeneratePdf();
    }

    // ─────────────────────────────────────────────────────────
    // ACTIVITY SUMMARY
    // ─────────────────────────────────────────────────────────
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
                    table.ColumnsDefinition(c =>
                    {
                        c.RelativeColumn(); c.RelativeColumn();
                        c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn();
                    });
                    table.Header(h =>
                    {
                        foreach (var col in new[] { "Student Name", "Student Code", "Commits", "Pull Requests", "Issues Done" })
                            h.Cell().Background(TableHeader).Padding(4).Text(col).FontColor(Colors.White).Bold();
                    });
                    bool alt = false;
                    if (project.team_members != null)
                    {
                        foreach (var tm in project.team_members)
                        {
                            var stat = activityList.FirstOrDefault(a => a.StudentId == tm.student_user_id);
                            string bg = alt ? TableRowAlt : Colors.White;
                            table.Cell().Background(bg).Padding(4).Text(tm.student_user?.user?.full_name ?? "");
                            table.Cell().Background(bg).Padding(4).Text(tm.student_user?.student_code ?? "");
                            table.Cell().Background(bg).Padding(4).Text(((int)(stat?.Commits ?? 0)).ToString());
                            table.Cell().Background(bg).Padding(4).Text(((int)(stat?.PRs ?? 0)).ToString());
                            table.Cell().Background(bg).Padding(4).Text(((int)(stat?.Issues ?? 0)).ToString());
                            alt = !alt;
                        }
                    }
                });
            });
        }).GeneratePdf();
    }

    // ─────────────────────────────────────────────────────────
    // ISO/IEEE 29148 SRS REPORT
    // ─────────────────────────────────────────────────────────
    public byte[] GenerateSrsReportPdf(SrsReportData data)
    {
        var projectName = !string.IsNullOrWhiteSpace(data.ProjectName)
            ? data.ProjectName
            : data.Project?.name ?? "N/A";

        var productDescription = string.IsNullOrWhiteSpace(data.Project?.description)
            ? "No product description was provided in the project record."
            : data.Project!.description!.Trim();

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2.5f, Unit.Centimetre);

                // ── HEADER ──
                page.Header().Column(col =>
                {
                    col.Item().BorderBottom(2).BorderColor(PrimaryColor).PaddingBottom(6).Row(row =>
                    {
                        row.RelativeItem().Column(inner =>
                        {
                            inner.Item().Text("Software Requirements Specification")
                                .Bold().FontSize(18).FontColor(PrimaryColor);
                            inner.Item().Text($"ISO/IEC/IEEE 29148:2018 Compliant")
                                .FontSize(9).FontColor(AccentColor);
                        });
                        row.ConstantItem(140).AlignRight().Column(inner =>
                        {
                            inner.Item().Text($"Project: {projectName}").Bold().FontSize(10);
                            inner.Item().Text($"Course: {data.CourseCode}").FontSize(9).FontColor(TextGray);
                            inner.Item().Text($"Generated: {data.GeneratedAt:dd MMM yyyy}").FontSize(9).FontColor(TextGray);
                            inner.Item().Text($"Version: 1.0").FontSize(9).FontColor(TextGray);
                        });
                    });
                });

                // ── FOOTER ──
                page.Footer().AlignCenter().Text(txt =>
                {
                    txt.Span("Software Requirements Specification  |  ").FontSize(8).FontColor(TextGray);
                    txt.Span("Page ").FontSize(8).FontColor(TextGray);
                    txt.CurrentPageNumber().FontSize(8).FontColor(TextGray);
                    txt.Span(" of ").FontSize(8).FontColor(TextGray);
                    txt.TotalPages().FontSize(8).FontColor(TextGray);
                });

                // ── CONTENT ──
                page.Content().Column(doc =>
                {
                    // ── COVER INFO ──
                    doc.Item().PaddingTop(20).Table(t =>
                    {
                        t.ColumnsDefinition(c => { c.ConstantColumn(160); c.RelativeColumn(); });
                        void InfoRow(string label, string value)
                        {
                            t.Cell().Background(TableRowAlt).Padding(5).Text(label).Bold().FontSize(9);
                            t.Cell().Padding(5).Text(value).FontSize(9);
                        }
                        InfoRow("Document Title", "Software Requirements Specification (SRS)");
                        InfoRow("Project", projectName);
                        InfoRow("Course Code", data.CourseCode);
                        InfoRow("Jira Project Key", data.JiraProjectKey);
                        InfoRow("GitHub Repository", data.GithubRepoUrl);
                        InfoRow("Date", data.GeneratedAt.ToString("dd MMMM yyyy"));
                        InfoRow("Standard", "ISO/IEC/IEEE 29148:2018");
                        InfoRow("Status", "Draft");
                    });

                    // ───────────────────────────────────────────────
                    // 1. INTRODUCTION
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "1. Introduction");

                    SubSection(doc, "1.1 Purpose");
                    doc.Item().PaddingLeft(10).Text(
                        "This Software Requirements Specification (SRS) document describes the functional and " +
                        "non-functional requirements for the system. It is intended for the development team, " +
                        "project stakeholders, lecturers, and evaluators. The document conforms to " +
                        "ISO/IEC/IEEE 29148:2018.").FontSize(10).FontColor(TextGray);

                    SubSection(doc, "1.2 Scope");
                    doc.Item().PaddingLeft(10).Text(
                        $"This document specifies requirements for the software product '{projectName}'. " +
                        "Where configured, requirements are traced to issues in the linked Jira project " +
                        "and to the linked source repository. The scope is bounded by the issues and " +
                        "materials included at the time this document was generated.")
                        .FontSize(10).FontColor(TextGray);

                    SubSection(doc, "1.3 Definitions, Acronyms, and Abbreviations");
                    AcronymTable(doc, new[]
                    {
                        ("SRS",   "Software Requirements Specification"),
                        ("FR",    "Functional Requirement"),
                        ("NFR",   "Non-Functional Requirement"),
                        ("API",   "Application Programming Interface"),
                        ("UI",    "User Interface"),
                        ("DB",    "Database"),
                        ("IEEE",  "Institute of Electrical and Electronics Engineers"),
                        ("CI/CD", "Continuous Integration / Continuous Delivery"),
                    });

                    SubSection(doc, "1.4 References");
                    doc.Item().PaddingLeft(10).Column(refs =>
                    {
                        refs.Item().Text("• ISO/IEC/IEEE 29148:2018 – Systems and software engineering – Life cycle processes – Requirements engineering").FontSize(9).FontColor(TextGray);
                        refs.Item().Text($"• Jira Project Board: {data.JiraSiteUrl}").FontSize(9).FontColor(TextGray);
                        refs.Item().Text($"• GitHub Repository: {data.GithubRepoUrl}").FontSize(9).FontColor(TextGray);
                    });

                    // ───────────────────────────────────────────────
                    // 2. GENERAL SYSTEM DESCRIPTION (ISO 29148)
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "2. General System Description");

                    SubSection(doc, "2.1 Product Perspective");
                    doc.Item().PaddingLeft(10).Text(productDescription).FontSize(10).FontColor(TextGray);
                    doc.Item().PaddingLeft(10).PaddingTop(6).Text(
                        "This perspective reflects the product as described above. Functional requirements " +
                        "derived from the linked issue tracker appear in Section 3. The document content " +
                        "is synchronized from the configured integrations at generation time.")
                        .FontSize(10).FontColor(TextGray).Italic();

                    SubSection(doc, "2.2 Product Functions (Summary)");
                    doc.Item().PaddingLeft(10).Text(
                        "The following summary lists high-level capabilities implied by Epic and Story issues " +
                        "in the linked Jira project (see Section 3 for full traceability). If no such issues " +
                        "exist, the product functions shall be elaborated by the project team outside this export.")
                        .FontSize(10).FontColor(TextGray);
                    doc.Item().PaddingLeft(10).PaddingTop(4).Column(funcs =>
                    {
                        if (data.SystemFeatures.Count == 0)
                        {
                            funcs.Item().Text("• [Placeholder] Functional capabilities shall be stated as Epic/Story issues in Jira or in project documentation.")
                                .FontSize(10).FontColor(TextGray).Italic();
                        }
                        else
                        {
                            foreach (var f in data.SystemFeatures.Take(12))
                                funcs.Item().Text($"• [{f.IssueKey}] {f.Title}").FontSize(10).FontColor(TextGray);
                            if (data.SystemFeatures.Count > 12)
                                funcs.Item().Text($"• … ({data.SystemFeatures.Count - 12} additional items in Section 3)").FontSize(9).FontColor(TextGray).Italic();
                        }
                    });

                    SubSection(doc, "2.3 User Classes and Characteristics");
                    doc.Item().PaddingLeft(10).Table(t =>
                    {
                        t.ColumnsDefinition(c => { c.ConstantColumn(120); c.RelativeColumn(); });
                        t.Header(h =>
                        {
                            h.Cell().Background(TableHeader).Padding(4).Text("Role").FontColor(Colors.White).Bold().FontSize(9);
                            h.Cell().Background(TableHeader).Padding(4).Text("Description").FontColor(Colors.White).Bold().FontSize(9);
                        });
                        var roles = new (string, string)[]
                        {
                            ("Admin",   "Full system access. Can manage users, courses, and view all reports."),
                            ("Lecturer","Can approve/reject integrations, view reports, and monitor project activity."),
                            ("Student", "Can submit Jira/GitHub links, view their own project dashboard."),
                        };
                        bool alt = false;
                        foreach (var (role, desc) in roles)
                        {
                            string bg = alt ? TableRowAlt : Colors.White;
                            t.Cell().Background(bg).Padding(4).Text(role).Bold().FontSize(9);
                            t.Cell().Background(bg).Padding(4).Text(desc).FontSize(9);
                            alt = !alt;
                        }
                    });

                    SubSection(doc, "2.4 Operating Environment");
                    doc.Item().PaddingLeft(10).Column(env =>
                    {
                        env.Item().Text(
                            "• Deployment target, runtime stack, and infrastructure constraints are determined by the project team and are not prescribed by this requirements export.")
                            .FontSize(10).FontColor(TextGray);
                        env.Item().Text(
                            string.IsNullOrWhiteSpace(data.GithubRepoUrl)
                                ? "• Linked source repository: not configured for this project."
                                : $"• Linked source repository: {data.GithubRepoUrl}")
                            .FontSize(10).FontColor(TextGray);
                        if (!string.IsNullOrEmpty(data.GithubDefaultBranch))
                            env.Item().Text($"• Default branch (reference): {data.GithubDefaultBranch}").FontSize(10).FontColor(TextGray);
                    });

                    SubSection(doc, "2.5 Team Composition");
                    if (data.TeamMembers.Count > 0)
                    {
                        doc.Item().PaddingLeft(10).Column(tm =>
                        {
                            foreach (var member in data.TeamMembers)
                                tm.Item().Text($"• {member}").FontSize(10).FontColor(TextGray);
                        });
                    }
                    else
                    {
                        doc.Item().PaddingLeft(10).Text("No team members found.").FontSize(10).FontColor(TextGray).Italic();
                    }

                    // ───────────────────────────────────────────────
                    // 3. SYSTEM FEATURES (Functional Requirements)
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "3. System Features (Functional Requirements)");
                    doc.Item().Text(
                        "The following features are derived from Jira issues of type Epic and Story, " +
                        "representing the high-level functional requirements of the system.")
                        .FontSize(10).FontColor(TextGray).Italic();

                    if (data.SystemFeatures.Count == 0)
                    {
                        doc.Item().PaddingTop(6).Text("No Epics or Stories found in the linked Jira project.")
                            .FontSize(10).FontColor(TextGray).Italic();
                    }

                    int featureIndex = 1;
                    foreach (var feat in data.SystemFeatures)
                    {
                        doc.Item().PaddingTop(10).Row(row =>
                        {
                            row.RelativeItem().Background(AccentColor).Padding(6)
                                .Text($"3.{featureIndex} [{feat.IssueKey}] {feat.Title}")
                                .Bold().FontSize(11).FontColor(Colors.White);
                        });

                        doc.Item().PaddingLeft(10).PaddingTop(4).Table(t =>
                        {
                            t.ColumnsDefinition(c => { c.ConstantColumn(110); c.RelativeColumn(); });
                            void Row2(string k, string v)
                            {
                                t.Cell().Background(TableRowAlt).Padding(4).Text(k).Bold().FontSize(9);
                                t.Cell().Padding(4).Text(v).FontSize(9);
                            }
                            Row2("Issue Key", feat.IssueKey);
                            Row2("Type", feat.IssueType);
                            Row2("Status", feat.Status ?? "N/A");
                            Row2("Description", string.IsNullOrWhiteSpace(feat.Description) ? "No description provided." : feat.Description);
                        });

                        // Sub-tasks as detailed requirements
                        if (feat.SubTasks.Count > 0)
                        {
                            doc.Item().PaddingLeft(10).PaddingTop(4)
                                .Text($"3.{featureIndex} Detailed Requirements (Sub-tasks / Tasks):")
                                .Bold().FontSize(10).FontColor(PrimaryColor);

                            doc.Item().PaddingLeft(10).Table(t =>
                            {
                                t.ColumnsDefinition(c =>
                                {
                                    c.ConstantColumn(90); c.RelativeColumn(3); c.ConstantColumn(70); c.ConstantColumn(70);
                                });
                                t.Header(h =>
                                {
                                    foreach (var col in new[] { "Issue Key", "Title", "Priority", "Status" })
                                        h.Cell().Background(TableHeader).Padding(4).Text(col)
                                            .FontColor(Colors.White).Bold().FontSize(9);
                                });
                                bool alt = false;
                                foreach (var sub in feat.SubTasks)
                                {
                                    string bg = alt ? TableRowAlt : Colors.White;
                                    t.Cell().Background(bg).Padding(4).Text(sub.IssueKey).FontSize(9);
                                    t.Cell().Background(bg).Padding(4).Text(sub.Title).FontSize(9);
                                    t.Cell().Background(bg).Padding(4).Text(sub.Priority ?? "N/A").FontSize(9);
                                    t.Cell().Background(bg).Padding(4).Text(sub.Status ?? "N/A").FontSize(9);
                                    alt = !alt;
                                }
                            });
                        }
                        featureIndex++;
                    }

                    // ───────────────────────────────────────────────
                    // 4. EXTERNAL INTERFACE REQUIREMENTS
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "4. External Interface Requirements");

                    SubSection(doc, "4.1 User Interfaces");
                    doc.Item().PaddingLeft(10).Text(
                        "Human–machine interfaces for this product shall be defined in project-specific design " +
                        "artifacts. This SRS does not prescribe a particular UI technology; any UI-related " +
                        "requirements appear in Section 3 or Section 4.3 when captured as Jira issues.")
                        .FontSize(10).FontColor(TextGray);

                    SubSection(doc, "4.2 Software Interfaces");
                    doc.Item().PaddingLeft(10).Table(t =>
                    {
                        t.ColumnsDefinition(c => { c.ConstantColumn(130); c.RelativeColumn(); });
                        t.Header(h =>
                        {
                            h.Cell().Background(TableHeader).Padding(4).Text("Interface").FontColor(Colors.White).Bold().FontSize(9);
                            h.Cell().Background(TableHeader).Padding(4).Text("Role in this SRS").FontColor(Colors.White).Bold().FontSize(9);
                        });
                        var ifaces = new (string, string)[]
                        {
                            ("Jira (linked project)", "Source of structured requirements issues (Epics, Stories, tasks) imported for this document."),
                            ("Source repository (linked)", "Reference for implementation artifacts; not a substitute for stated requirements."),
                        };
                        bool alt = false;
                        foreach (var (sys, purpose) in ifaces)
                        {
                            string bg = alt ? TableRowAlt : Colors.White;
                            t.Cell().Background(bg).Padding(4).Text(sys).Bold().FontSize(9);
                            t.Cell().Background(bg).Padding(4).Text(purpose).FontSize(9);
                            alt = !alt;
                        }
                    });

                    if (data.ExternalInterfaces.Count > 0)
                    {
                        SubSection(doc, "4.3 Interface Requirements from Jira");
                        IssueTable(doc, data.ExternalInterfaces);
                    }

                    SubSection(doc, "4.4 Communication Interfaces");
                    doc.Item().PaddingLeft(10).Text(
                        "External communication constraints (protocols, endpoints, authentication) shall be " +
                        "specified in design documentation or as explicit Jira issues. This SRS does not " +
                        "embed implementation-specific port or middleware assumptions.")
                        .FontSize(10).FontColor(TextGray);

                    // ───────────────────────────────────────────────
                    // 5. NON-FUNCTIONAL REQUIREMENTS
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "5. Non-Functional Requirements");

                    if (data.NonFunctionalRequirements.Count > 0)
                    {
                        IssueTable(doc, data.NonFunctionalRequirements);
                    }
                    else
                    {
                        doc.Item().PaddingTop(6).Text("No specific non-functional requirements tracked in Jira.")
                            .FontSize(10).FontColor(TextGray).Italic();
                    }

                    // ───────────────────────────────────────────────
                    // 6. OTHER REQUIREMENTS
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "6. Other Requirements");

                    SubSection(doc, "6.1 Legal and Compliance");
                    doc.Item().PaddingLeft(10).Text(
                        "The product shall comply with applicable laws, institutional policies, and data " +
                        "protection obligations applicable to the deployment context. Credential handling " +
                        "and third-party API access shall follow the project team's security policies.")
                        .FontSize(10).FontColor(TextGray);

                    SubSection(doc, "6.2 Localisation");
                    doc.Item().PaddingLeft(10).Text(
                        "Languages, locales, and time-zone conventions for the delivered product shall be " +
                        "specified by the project team where not already covered by Jira issues in this document.")
                        .FontSize(10).FontColor(TextGray);

                    // ── SIGN-OFF TABLE ──
                    doc.Item().PaddingTop(30).Table(t =>
                    {
                        t.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); });
                        t.Header(h =>
                        {
                            foreach (var col in new[] { "Role", "Name", "Signature / Date" })
                                h.Cell().Background(TableHeader).Padding(6).Text(col).FontColor(Colors.White).Bold().FontSize(9);
                        });
                        foreach (var (role, _) in new[] { ("Lecturer", ""), ("Leader", ""), ("Team Member", "") })
                        {
                            t.Cell().Border(1).BorderColor(BorderGray).Padding(20).Text(role).FontSize(9);
                            t.Cell().Border(1).BorderColor(BorderGray).Padding(20).Text("").FontSize(9);
                            t.Cell().Border(1).BorderColor(BorderGray).Padding(20).Text("").FontSize(9);
                        }
                    });
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateCourseSrsReportPdf(string courseName, List<SrsReportData> reports)
    {
        return Document.Create(container =>
        {
            foreach (var report in reports)
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);

                    var projectName = !string.IsNullOrWhiteSpace(report.ProjectName)
                        ? report.ProjectName
                        : report.Project?.name ?? "N/A";

                    page.Header().Column(col =>
                    {
                        col.Item().Text($"SRS Summary - {courseName}")
                            .Bold().FontSize(18).FontColor(PrimaryColor);
                        col.Item().Text($"Project: {projectName} | Course: {report.CourseCode}")
                            .FontSize(10).FontColor(TextGray);
                    });

                    page.Content().Column(content =>
                    {
                        content.Spacing(8);
                        content.Item().Text("Project Information").Bold().FontSize(12).FontColor(AccentColor);
                        content.Item().Text($"Jira Key: {report.JiraProjectKey}");
                        content.Item().Text($"Jira URL: {report.JiraSiteUrl}");
                        content.Item().Text($"GitHub Repository: {report.GithubRepoUrl}");
                        content.Item().Text($"Generated At: {report.GeneratedAt:dd MMM yyyy HH:mm}");

                        content.Item().PaddingTop(4).Text("Team Members").Bold().FontSize(12).FontColor(AccentColor);
                        if (report.TeamMembers.Count > 0)
                        {
                            foreach (var member in report.TeamMembers)
                                content.Item().Text($"- {member}").FontSize(10);
                        }
                        else
                        {
                            content.Item().Text("No team members found.").Italic().FontColor(TextGray);
                        }

                        content.Item().PaddingTop(4).Text("System Features").Bold().FontSize(12).FontColor(AccentColor);
                        if (report.SystemFeatures.Count > 0)
                        {
                            foreach (var feature in report.SystemFeatures)
                                content.Item().Text($"- [{feature.IssueKey}] {feature.Title} ({feature.IssueType})").FontSize(10);
                        }
                        else
                        {
                            content.Item().Text("No Jira features found.").Italic().FontColor(TextGray);
                        }
                    });

                    page.Footer().AlignCenter().Text(txt =>
                    {
                        txt.Span("Course SRS bundle  |  ").FontSize(8).FontColor(TextGray);
                        txt.Span("Page ").FontSize(8).FontColor(TextGray);
                        txt.CurrentPageNumber().FontSize(8).FontColor(TextGray);
                    });
                });
            }
        }).GeneratePdf();
    }

    // ─────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────
    private static void SectionHeader(ColumnDescriptor doc, string title)
    {
        doc.Item().PaddingTop(20).BorderBottom(2).BorderColor(PrimaryColor)
            .PaddingBottom(4).Text(title).Bold().FontSize(14).FontColor(PrimaryColor);
    }

    private static void SubSection(ColumnDescriptor doc, string title)
    {
        doc.Item().PaddingTop(10).Text(title).SemiBold().FontSize(11).FontColor(AccentColor);
    }

    private static void AcronymTable(ColumnDescriptor doc, IEnumerable<(string, string)> rows)
    {
        doc.Item().PaddingLeft(10).Table(t =>
        {
            t.ColumnsDefinition(c => { c.ConstantColumn(80); c.RelativeColumn(); });
            t.Header(h =>
            {
                h.Cell().Background(TableHeader).Padding(4).Text("Acronym").FontColor(Colors.White).Bold().FontSize(9);
                h.Cell().Background(TableHeader).Padding(4).Text("Definition").FontColor(Colors.White).Bold().FontSize(9);
            });
            bool alt = false;
            foreach (var (ac, def) in rows)
            {
                string bg = alt ? TableRowAlt : Colors.White;
                t.Cell().Background(bg).Padding(4).Text(ac).Bold().FontSize(9);
                t.Cell().Background(bg).Padding(4).Text(def).FontSize(9);
                alt = !alt;
            }
        });
    }

    private static void IssueTable(ColumnDescriptor doc, List<SrsIssueRow> rows)
    {
        doc.Item().PaddingLeft(10).Table(t =>
        {
            t.ColumnsDefinition(c =>
            {
                c.ConstantColumn(90); c.RelativeColumn(3); c.ConstantColumn(70); c.ConstantColumn(70);
            });
            t.Header(h =>
            {
                foreach (var col in new[] { "Issue Key", "Title", "Priority", "Status" })
                    h.Cell().Background(TableHeader).Padding(4).Text(col)
                        .FontColor(Colors.White).Bold().FontSize(9);
            });
            bool alt = false;
            foreach (var row in rows)
            {
                string bg = alt ? TableRowAlt : Colors.White;
                t.Cell().Background(bg).Padding(4).Text(row.IssueKey).FontSize(9);
                t.Cell().Background(bg).Padding(4).Text(row.Title).FontSize(9);
                t.Cell().Background(bg).Padding(4).Text(row.Priority ?? "N/A").FontSize(9);
                t.Cell().Background(bg).Padding(4).Text(row.Status ?? "N/A").FontSize(9);
                alt = !alt;
            }
        });
    }
}
