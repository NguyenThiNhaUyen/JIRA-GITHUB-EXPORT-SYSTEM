using JiraGithubExport.IntegrationService.Application.Implementations.Reports;
using JiraGithubExport.IntegrationService.Application.Interfaces.Reports;
using JiraGithubExport.Shared.Models;
using QuestPDF.Infrastructure;

// Required by QuestPDF
QuestPDF.Settings.License = LicenseType.Community;

Console.WriteLine("đŸ”§ Building sample SRS data...");

// â”€â”€ Sample Project â”€â”€
var Project = new Project
{
    Id = 1,
    name = "JIRA-GITHUB Export System",
    description = "A system to monitor and export Student Project data from Jira and GitHub.",
    status = "ACTIVE",
    TeamMembers = new List<TeamMember>
    {
        new TeamMember { TeamRole = "LEADER",  StudentUser = new Student { StudentCode = "SE171234", User = new User { FullName = "Nguyen Thi Nha Uyen" } } },
        new TeamMember { TeamRole = "MEMBER",  StudentUser = new Student { StudentCode = "SE171235", User = new User { FullName = "Tran Van Phat" } } },
        new TeamMember { TeamRole = "MEMBER",  StudentUser = new Student { StudentCode = "SE171236", User = new User { FullName = "Le Thi Mai" } } },
    }
};

// â”€â”€ Sample SrsReportData â”€â”€
var data = new SrsReportData
{
    Project            = Project,
    JiraProjectKey     = "JGES",
    JiraSiteUrl        = "https://myteam.atlassian.net",
    GithubRepoUrl      = "https://github.com/myorg/JIRA-GITHUB-EXPORT-SYSTEM",
    GithubDefaultBranch = "feature/Backend",
    GithubTotalCommits = 142,
    GithubTotalPRs     = 28,
    GeneratedAt        = DateTime.UtcNow,

    TeamMembers = new List<string>
    {
        "Nguyen Thi Nha Uyen [SE171234] â€” LEADER",
        "Tran Van Phat [SE171235] â€” MEMBER",
        "Le Thi Mai [SE171236] â€” MEMBER",
    },

    SystemFeatures = new List<SrsFeature>
    {
        new SrsFeature
        {
            IssueKey    = "JGES-1",
            Title       = "Authentication & Authorization",
            Description = "Users must be able to register, log in with Email/Password, and authenticate via Google SSO. Role-based access control (ADMIN, Lecturer, Student) must be enforced.",
            IssueType   = "EPIC",
            Status      = "In Progress",
            SubTasks    = new List<SrsIssueRow>
            {
                new SrsIssueRow { IssueKey = "JGES-11", Title = "Implement JWT login endpoint", Priority = "High", Status = "Done" },
                new SrsIssueRow { IssueKey = "JGES-12", Title = "Implement Google SSO callback", Priority = "High", Status = "In Progress" },
                new SrsIssueRow { IssueKey = "JGES-13", Title = "Implement Role-based middleware", Priority = "Medium", Status = "Done" },
            }
        },
        new SrsFeature
        {
            IssueKey    = "JGES-2",
            Title       = "Project Jira/GitHub Integration",
            Description = "Team Leaders can submit GitHub repository URLs and Jira Project keys for their Project. Lecturers must approve or reject the submission before synchronisation begins.",
            IssueType   = "EPIC",
            Status      = "In Progress",
            SubTasks    = new List<SrsIssueRow>
            {
                new SrsIssueRow { IssueKey = "JGES-21", Title = "POST /api/Projects/{id}/integrations endpoint", Priority = "High", Status = "Done" },
                new SrsIssueRow { IssueKey = "JGES-22", Title = "POST /api/Projects/{id}/integrations/approve", Priority = "High", Status = "Done" },
                new SrsIssueRow { IssueKey = "JGES-23", Title = "POST /api/Projects/{id}/integrations/reject", Priority = "Medium", Status = "Done" },
            }
        },
        new SrsFeature
        {
            IssueKey    = "JGES-3",
            Title       = "Automatic Data Synchronisation",
            Description = "The system periodically syncs Jira issues and GitHub commits/pull requests using a background worker. Sync only runs for approved Project integrations.",
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
        new SrsIssueRow { IssueKey = "JGES-NFR-01", Title = "API response time â‰¤ 500ms under normal load", Priority = "High",   Status = "To Do" },
        new SrsIssueRow { IssueKey = "JGES-NFR-02", Title = "System uptime â‰¥ 99% (excluding maintenance)",  Priority = "High",   Status = "To Do" },
        new SrsIssueRow { IssueKey = "JGES-NFR-03", Title = "All passwords hashed using BCrypt",              Priority = "High",   Status = "Done" },
        new SrsIssueRow { IssueKey = "JGES-NFR-04", Title = "HTTPS mandatory for all communication",         Priority = "High",   Status = "Done" },
    },

    ExternalInterfaces = new List<SrsIssueRow>
    {
        new SrsIssueRow { IssueKey = "JGES-INT-01", Title = "Jira REST API v3 â€“ fetch issues and worklogs",  Priority = "High", Status = "Done" },
        new SrsIssueRow { IssueKey = "JGES-INT-02", Title = "GitHub REST API v3 â€“ fetch commits and PRs",    Priority = "High", Status = "Done" },
        new SrsIssueRow { IssueKey = "JGES-INT-03", Title = "Google OAuth2 â€“ SSO login for Students",        Priority = "Medium", Status = "In Progress" },
    },
};

// â”€â”€ Generate PDF â”€â”€
Console.WriteLine("đŸ“„ Generating ISO/IEEE 29148 SRS PDF...");
var generator = new PdfReportGenerator();
var pdfBytes  = generator.GenerateSrsReportPdf(data);

// â”€â”€ Save to Desktop â”€â”€
var outputPath = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.Desktop),
    $"SRS_Sample_{DateTime.Now:yyyyMMdd_HHmmss}.pdf");

await File.WriteAllBytesAsync(outputPath, pdfBytes);

Console.WriteLine($"âœ… PDF saved to: {outputPath}");
Console.WriteLine("đŸ‰ Open the file to review the SRS report!");

