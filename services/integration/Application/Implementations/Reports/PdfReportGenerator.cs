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
                            inner.Item().Text($"Project: {data.Project.name}").Bold().FontSize(10);
                            inner.Item().Text($"Generated: {data.GeneratedAt:dd MMM yyyy}").FontSize(9).FontColor(TextGray);
                            inner.Item().Text($"Version: 1.0").FontSize(9).FontColor(TextGray);
                        });
                    });
                });

                // ── FOOTER ──
                page.Footer().AlignCenter().Text(txt =>
                {
                    txt.Span("JIRA-GITHUB Export System  |  ").FontSize(8).FontColor(TextGray);
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
                        InfoRow("Project", data.Project.name);
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
                        $"The system is the '{data.Project.name}' software project. It integrates with " +
                        $"Jira ({data.JiraSiteUrl}) for issue tracking and GitHub ({data.GithubRepoUrl}) " +
                        "for source code management. The system aims to automate reporting and monitoring " +
                        "of student project activities.").FontSize(10).FontColor(TextGray);

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
                    // 2. OVERALL DESCRIPTION
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "2. Overall Description");

                    SubSection(doc, "2.1 Product Perspective");
                    doc.Item().PaddingLeft(10).Text(
                        $"This system is a standalone web application that integrates with Jira and GitHub " +
                        $"to track, monitor, and export student project data. It operates as an API " +
                        $"backend deployed on cloud infrastructure (Render.com + Supabase PostgreSQL).").FontSize(10).FontColor(TextGray);

                    SubSection(doc, "2.2 Product Functions (Summary)");
                    doc.Item().PaddingLeft(10).Column(funcs =>
                    {
                        foreach (var f in new[]
                        {
                            "Synchronise Jira issues and GitHub commits/pull requests automatically",
                            "Allow lecturers to approve or reject group Jira/GitHub link submissions",
                            "Generate SRS, Activity Summary, and Commit Statistics reports",
                            "Monitor inactive team members and raise alerts",
                            "Provide secure JWT authentication with role-based access control",
                        })
                        {
                            funcs.Item().Text($"• {f}").FontSize(10).FontColor(TextGray);
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
                        env.Item().Text("• Backend: ASP.NET Core Web API (.NET 8), deployed on Render.com").FontSize(10).FontColor(TextGray);
                        env.Item().Text("• Database: PostgreSQL on Supabase").FontSize(10).FontColor(TextGray);
                        env.Item().Text("• Cache: Redis on Upstash").FontSize(10).FontColor(TextGray);
                        env.Item().Text($"• Source Control: GitHub ({data.GithubRepoUrl})").FontSize(10).FontColor(TextGray);
                        if (!string.IsNullOrEmpty(data.GithubDefaultBranch))
                            env.Item().Text($"• Default Branch: {data.GithubDefaultBranch}").FontSize(10).FontColor(TextGray);
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
                        "The system exposes a RESTful HTTP API consumed by a web-based frontend. " +
                        "The API follows OpenAPI 3.0 specification and is documented via Swagger UI " +
                        "at /swagger/index.html.").FontSize(10).FontColor(TextGray);

                    SubSection(doc, "4.2 Software Interfaces");
                    doc.Item().PaddingLeft(10).Table(t =>
                    {
                        t.ColumnsDefinition(c => { c.ConstantColumn(130); c.RelativeColumn(); });
                        t.Header(h =>
                        {
                            h.Cell().Background(TableHeader).Padding(4).Text("System").FontColor(Colors.White).Bold().FontSize(9);
                            h.Cell().Background(TableHeader).Padding(4).Text("Purpose").FontColor(Colors.White).Bold().FontSize(9);
                        });
                        var ifaces = new (string, string)[]
                        {
                            ("Jira REST API v3", "Retrieve issues, worklogs, sprints, and project metadata"),
                            ("GitHub REST API v3","Retrieve commits, pull requests, branches, and repository info"),
                            ("PostgreSQL (Supabase)", "Persistent data storage"),
                            ("Redis (Upstash)", "Distributed locking and caching for background sync worker"),
                            ("JWT (HS256)", "Stateless authentication and authorisation"),
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
                        "• All API communication uses HTTPS (TLS 1.2+).\n" +
                        "• Jira and GitHub APIs are accessed over HTTPS REST.\n" +
                        "• Redis connection uses SSL on port 6379.\n" +
                        "• PostgreSQL connection uses SSL on port 5432.").FontSize(10).FontColor(TextGray);

                    // GitHub stats box
                    if (data.GithubTotalCommits > 0 || data.GithubTotalPRs > 0)
                    {
                        doc.Item().PaddingTop(8).Table(t =>
                        {
                            t.ColumnsDefinition(c => { c.RelativeColumn(); c.RelativeColumn(); c.RelativeColumn(); });
                            void StatBox(string label, string value)
                            {
                                t.Cell().Border(1).BorderColor(BorderGray).Padding(8).Column(col =>
                                {
                                    col.Item().Text(value).Bold().FontSize(20).FontColor(AccentColor).AlignCenter();
                                    col.Item().Text(label).FontSize(9).FontColor(TextGray).AlignCenter();
                                });
                            }
                            StatBox("Total Commits", data.GithubTotalCommits.ToString());
                            StatBox("Pull Requests", data.GithubTotalPRs.ToString());
                            StatBox("Default Branch", data.GithubDefaultBranch ?? "N/A");
                        });
                    }

                    // ───────────────────────────────────────────────
                    // 5. NON-FUNCTIONAL REQUIREMENTS
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "5. Non-Functional Requirements");

                    // Standard NFRs table (always included)
                    SubSection(doc, "5.1 Standard Non-Functional Requirements");
                    doc.Item().Table(t =>
                    {
                        t.ColumnsDefinition(c => { c.ConstantColumn(40); c.ConstantColumn(120); c.RelativeColumn(); c.ConstantColumn(80); });
                        t.Header(h =>
                        {
                            foreach (var col in new[] { "ID", "Category", "Requirement", "Metric" })
                                h.Cell().Background(TableHeader).Padding(4).Text(col).FontColor(Colors.White).Bold().FontSize(9);
                        });
                        var nfrRows = new[]
                        {
                            ("NFR-01", "Performance",   "API response time for non-report endpoints must be ≤ 500ms under normal load.", "≤ 500 ms"),
                            ("NFR-02", "Availability",  "The system must be available at least 99% of the time (excluding scheduled maintenance).", "≥ 99% uptime"),
                            ("NFR-03", "Security",      "All passwords must be stored using BCrypt hashing. JWT tokens expire after a configurable period.", "BCrypt + JWT"),
                            ("NFR-04", "Scalability",   "The sync worker must handle at least 50 concurrent project integrations without bottlenecks.", "50+ projects"),
                            ("NFR-05", "Reliability",   "Failed sync jobs must be logged and retried without data loss.", "Auto-retry"),
                            ("NFR-06", "Maintainability","Code must follow C# naming conventions and include XML documentation for public APIs.", "Code review"),
                            ("NFR-07", "Portability",   "The system is containerised with Docker and deployable on any OCI-compliant platform.", "Docker image"),
                        };
                        bool alt = false;
                        foreach (var (id, cat, req, metric) in nfrRows)
                        {
                            string bg = alt ? TableRowAlt : Colors.White;
                            t.Cell().Background(bg).Padding(4).Text(id).Bold().FontSize(9);
                            t.Cell().Background(bg).Padding(4).Text(cat).FontSize(9);
                            t.Cell().Background(bg).Padding(4).Text(req).FontSize(9);
                            t.Cell().Background(bg).Padding(4).Text(metric).FontSize(9);
                            alt = !alt;
                        }
                    });

                    // NFRs from Jira (if any)
                    if (data.NonFunctionalRequirements.Count > 0)
                    {
                        SubSection(doc, "5.2 Additional NFRs from Jira");
                        IssueTable(doc, data.NonFunctionalRequirements);
                    }

                    // ───────────────────────────────────────────────
                    // 6. OTHER REQUIREMENTS
                    // ───────────────────────────────────────────────
                    SectionHeader(doc, "6. Other Requirements");

                    SubSection(doc, "6.1 Legal and Compliance");
                    doc.Item().PaddingLeft(10).Text(
                        "• The system must comply with applicable data protection regulations " +
                        "(e.g. privacy of student data).\n" +
                        "• API tokens for Jira and GitHub must be stored as encrypted environment " +
                        "variables and never committed to version control.")
                        .FontSize(10).FontColor(TextGray);

                    SubSection(doc, "6.2 Localisation");
                    doc.Item().PaddingLeft(10).Text(
                        "The primary language of the user interface is English. " +
                        "Date/time values must be stored as UTC and converted to the local timezone on the frontend.")
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
