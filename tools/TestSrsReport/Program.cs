using JiraGithubExport.IntegrationService.Application.Implementations.Reports;
using JiraGithubExport.IntegrationService.Application.Interfaces.Reports;
using JiraGithubExport.Shared.Models;
using QuestPDF.Infrastructure;

// Required by QuestPDF
QuestPDF.Settings.License = LicenseType.Community;

Console.WriteLine("🔧 Building sample SRS data...");

// ── Sample project ──
var project = new project
{
    id   = 1,
    name = "JIRA-GITHUB Export System",
    description = "A system to monitor and export student project data from Jira and GitHub.",
    status = "ACTIVE",
    team_members = new List<team_member>
    {
        new team_member { team_role = "LEADER",  student_user = new student { student_code = "SE171234", user = new user { full_name = "Nguyen Thi Nha Uyen" } } },
        new team_member { team_role = "MEMBER",  student_user = new student { student_code = "SE171235", user = new user { full_name = "Tran Van Phat" } } },
        new team_member { team_role = "MEMBER",  student_user = new student { student_code = "SE171236", user = new user { full_name = "Le Thi Mai" } } },
    }
};

// ── Sample SrsReportData ──
var data = new SrsReportData
{
    Project            = project,
    JiraProjectKey     = "JGES",
    JiraSiteUrl        = "https://myteam.atlassian.net",
    GithubRepoUrl      = "https://github.com/myorg/JIRA-GITHUB-EXPORT-SYSTEM",
    GithubDefaultBranch = "feature/Backend",
    GeneratedAt        = DateTime.UtcNow,

    TeamMembers = new List<string>
    {
        "Nguyen Thi Nha Uyen [SE171234] — LEADER",
        "Tran Van Phat [SE171235] — MEMBER",
        "Le Thi Mai [SE171236] — MEMBER",
    },

    SystemFeatures = new List<SrsFeature>
    {
        new SrsFeature
        {
            IssueKey    = "JGES-1",
            Title       = "Authentication & Authorization",
            Description = "Users must be able to register, log in with email/password, and authenticate via Google SSO. Role-based access control (ADMIN, LECTURER, STUDENT) must be enforced.",
            IssueType   = "EPIC",
            Status      = "In Progress",
            SubTasks    = new List<SrsIssueRow>
            {
                new SrsIssueRow { IssueKey = "JGES-11", Title = "Implement JWT login endpoint", Priority = "High", Status = "Done" },
                new SrsIssueRow { IssueKey = "JGES-12", Title = "Implement Google SSO callback", Priority = "High", Status = "In Progress" },
                new SrsIssueRow { IssueKey = "JGES-13", Title = "Implement role-based middleware", Priority = "Medium", Status = "Done" },
            }
        },
        new SrsFeature
        {
            IssueKey    = "JGES-2",
            Title       = "Project Jira/GitHub Integration",
            Description = "Team Leaders can submit GitHub repository URLs and Jira project keys for their project. Lecturers must approve or reject the submission before synchronisation begins.",
            IssueType   = "EPIC",
            Status      = "In Progress",
            SubTasks    = new List<SrsIssueRow>
            {
                new SrsIssueRow { IssueKey = "JGES-21", Title = "POST /api/projects/{id}/integrations endpoint", Priority = "High", Status = "Done" },
                new SrsIssueRow { IssueKey = "JGES-22", Title = "POST /api/projects/{id}/integrations/approve", Priority = "High", Status = "Done" },
                new SrsIssueRow { IssueKey = "JGES-23", Title = "POST /api/projects/{id}/integrations/reject", Priority = "Medium", Status = "Done" },
            }
        },
        new SrsFeature
        {
            IssueKey    = "JGES-3",
            Title       = "Automatic Data Synchronisation",
            Description = "The system periodically syncs Jira issues and GitHub commits/pull requests using a background worker. Sync only runs for approved project integrations.",
            IssueType   = "STORY",
            Status      = "To Do",
            SubTasks    = new List<SrsIssueRow>
            {
                new SrsIssueRow { IssueKey = "JGES-31", Title = "Implement SyncWorker with Redis distributed lock", Priority = "High", Status = "Done" },
                new SrsIssueRow { IssueKey = "JGES-32", Title = "Sync Jira issues via REST API", Priority = "High", Status = "Done" },
                new SrsIssueRow { IssueKey = "JGES-33", Title = "Sync GitHub commits and pull requests", Priority = "High", Status = "Done" },
            }
        },
        new SrsFeature
        {
            IssueKey    = "JGES-4",
            Title       = "Report Export (PDF / Excel)",
            Description = "Lecturers can generate SRS, Commit Statistics, Team Roster, and Activity Summary reports as PDF or Excel files.",
            IssueType   = "STORY",
            Status      = "In Progress",
            SubTasks    = new List<SrsIssueRow>
            {
                new SrsIssueRow { IssueKey = "JGES-41", Title = "Generate SRS PDF per ISO/IEEE 29148", Priority = "High", Status = "In Progress" },
                new SrsIssueRow { IssueKey = "JGES-42", Title = "Generate Commit Statistics Excel", Priority = "Medium", Status = "Done" },
                new SrsIssueRow { IssueKey = "JGES-43", Title = "Generate Activity Summary PDF", Priority = "Medium", Status = "Done" },
            }
        },
    },

    NonFunctionalRequirements = new List<SrsIssueRow>
    {
        new SrsIssueRow { IssueKey = "JGES-NFR-01", Title = "API response time ≤ 500ms under normal load", Priority = "High",   Status = "To Do" },
        new SrsIssueRow { IssueKey = "JGES-NFR-02", Title = "System uptime ≥ 99% (excluding maintenance)",  Priority = "High",   Status = "To Do" },
        new SrsIssueRow { IssueKey = "JGES-NFR-03", Title = "All passwords hashed using BCrypt",              Priority = "High",   Status = "Done" },
        new SrsIssueRow { IssueKey = "JGES-NFR-04", Title = "HTTPS mandatory for all communication",         Priority = "High",   Status = "Done" },
    },

    ExternalInterfaces = new List<SrsIssueRow>
    {
        new SrsIssueRow { IssueKey = "JGES-INT-01", Title = "Jira REST API v3 – fetch issues and worklogs",  Priority = "High", Status = "Done" },
        new SrsIssueRow { IssueKey = "JGES-INT-02", Title = "GitHub REST API v3 – fetch commits and PRs",    Priority = "High", Status = "Done" },
        new SrsIssueRow { IssueKey = "JGES-INT-03", Title = "Google OAuth2 – SSO login for students",        Priority = "Medium", Status = "In Progress" },
    },
};

// ── Generate PDF ──
Console.WriteLine("📄 Generating ISO/IEEE 29148 SRS PDF...");
var generator = new PdfReportGenerator();
var pdfBytes  = generator.GenerateSrsReportPdf(data);

// ── Save to Desktop ──
var outputPath = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.Desktop),
    $"SRS_Sample_{DateTime.Now:yyyyMMdd_HHmmss}.pdf");

await File.WriteAllBytesAsync(outputPath, pdfBytes);

Console.WriteLine($"✅ PDF saved to: {outputPath}");
Console.WriteLine("🎉 Open the file to review the SRS report!");
