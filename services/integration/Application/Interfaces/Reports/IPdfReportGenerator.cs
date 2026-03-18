using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.IntegrationService.Application.Interfaces.Reports;

public interface IPdfReportGenerator
{
    byte[] GenerateCommitStatisticsPdf(string courseName, List<Project> projects);
    byte[] GenerateTeamRosterPdf(Project project);
    byte[] GenerateActivitySummaryPdf(Project project, List<dynamic> activityList);
    byte[] GenerateSrsReportPdf(SrsReportData data);
}

/// <summary>
/// Rich data context for generating a full ISO/IEEE 29148 SRS document.
/// </summary>
public class SrsReportData
{
    // Project info
    public Project Project { get; set; } = null!;
    public string JiraProjectKey { get; set; } = "";
    public string JiraSiteUrl { get; set; } = "";
    public string GithubRepoUrl { get; set; } = "";
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    // Chapter 3 - System Features (Epics / Stories from Jira)
    public List<SrsFeature> SystemFeatures { get; set; } = new();

    // Chapter 4 - External Interface Requirements (Tasks tagged as interface)
    public List<SrsIssueRow> ExternalInterfaces { get; set; } = new();

    // Chapter 5 - Nonfunctional Requirements (NFR)
    public List<SrsIssueRow> NonFunctionalRequirements { get; set; } = new();

    // For Chapter 2 - Overall Description
    public string? GithubDefaultBranch { get; set; }
    public int GithubTotalCommits { get; set; }
    public int GithubTotalPRs { get; set; }
    public List<string> TeamMembers { get; set; } = new();
}

public class SrsFeature
{
    public string IssueKey { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string IssueType { get; set; } = "";
    public string? Status { get; set; }
    public List<SrsIssueRow> SubTasks { get; set; } = new();
}

public class SrsIssueRow
{
    public string IssueKey { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string? Priority { get; set; }
    public string? Status { get; set; }
}

