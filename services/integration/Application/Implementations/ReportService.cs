using System.Security.Claims;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting;
using JiraGithubExport.IntegrationService.Application.Interfaces.Reports;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ReportService : IReportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ReportService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IWebHostEnvironment _env;
    private readonly IExcelReportGenerator _excelReportGenerator;
    private readonly IPdfReportGenerator _pdfReportGenerator;

    public ReportService(
        IUnitOfWork unitOfWork, 
        ILogger<ReportService> logger, 
        IHttpContextAccessor httpContextAccessor, 
        IWebHostEnvironment env,
        IExcelReportGenerator excelReportGenerator,
        IPdfReportGenerator pdfReportGenerator)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _env = env;
        _excelReportGenerator = excelReportGenerator;
        _pdfReportGenerator = pdfReportGenerator;
    }

    private long GetCurrentUserId()
    {
        var claim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.TryParse(claim, out var id) ? id : 0;
    }

    private string GetReportDirectory()
    {
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var reportsPath = Path.Combine(webRoot, "reports");
        if (!Directory.Exists(reportsPath))
        {
            Directory.CreateDirectory(reportsPath);
        }
        return reportsPath;
    }

    public async Task<long> GenerateCommitStatisticsReportAsync(long courseId, string format)
    {
        try
        {
            var course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.id == courseId);
            if (course == null) throw new NotFoundException("Course not found");

            string fileName = $"course_{courseId}_commits_{DateTime.UtcNow:yyyyMMddHHmmss}.{(format.Equals("excel", StringComparison.OrdinalIgnoreCase) ? "xlsx" : format.ToLower())}";
            string filePath = Path.Combine(GetReportDirectory(), fileName);

            var reportExport = new report_export
            {
                report_type = "COMMIT_STATISTICS",
                scope = "COURSE",
                scope_entity_id = courseId,
                format = format,
                status = "COMPLETED",
                requested_by_user_id = GetCurrentUserId(),
                requested_at = DateTime.UtcNow,
                file_url = $"/reports/{fileName}"
            };

            var projects = await _unitOfWork.Projects.Query()
                .Include(p => p.team_members)
                    .ThenInclude(tm => tm.student_user)
                        .ThenInclude(s => s.user)
                .Where(p => p.course_id == courseId)
                .ToListAsync();

            if (format.Equals("excel", StringComparison.OrdinalIgnoreCase) || format.Equals("xlsx", StringComparison.OrdinalIgnoreCase))
            {
<<<<<<< HEAD
                var fileBytes = _excelReportGenerator.GenerateCommitStatisticsReport(course.course_name, projects);
=======
                var fileBytes = _excelReportGenerator.GenerateCommitStatisticsReport(course.course_name ?? "Unknown Course", projects);
>>>>>>> origin
                await File.WriteAllBytesAsync(filePath, fileBytes);
            }
            else if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
            {
<<<<<<< HEAD
                var fileBytes = _pdfReportGenerator.GenerateCommitStatisticsPdf(course.course_name, projects);
=======
                var fileBytes = _pdfReportGenerator.GenerateCommitStatisticsPdf(course.course_name ?? "Unknown Course", projects);
>>>>>>> origin
                await File.WriteAllBytesAsync(filePath, fileBytes);
            }

            _logger.LogInformation("Generated commit stats for course {CourseName} at {FilePath}", course.course_name, filePath);

            _unitOfWork.ReportExports.Add(reportExport);
            await _unitOfWork.SaveChangesAsync();

            return reportExport.id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate commit statistics report for course {CourseId}", courseId);
            throw;
        }
    }

    public async Task<long> GenerateTeamRosterReportAsync(long projectId, string format)
    {
        try
        {
            var project = await _unitOfWork.Projects.Query()
                .Include(p => p.team_members)
                    .ThenInclude(tm => tm.student_user)
                        .ThenInclude(s => s.user)
                .FirstOrDefaultAsync(p => p.id == projectId);
            if (project == null) throw new NotFoundException("Project not found");

            string fileName = $"project_{projectId}_roster_{DateTime.UtcNow:yyyyMMddHHmmss}.{(format.Equals("excel", StringComparison.OrdinalIgnoreCase) ? "xlsx" : format.ToLower())}";
            string filePath = Path.Combine(GetReportDirectory(), fileName);

            var reportExport = new report_export
            {
                report_type = "TEAM_ROSTER",
                scope = "PROJECT",
                scope_entity_id = projectId,
                format = format,
                status = "COMPLETED",
                requested_by_user_id = GetCurrentUserId(),
                requested_at = DateTime.UtcNow,
                file_url = $"/reports/{fileName}"
            };

            if (format.Equals("excel", StringComparison.OrdinalIgnoreCase) || format.Equals("xlsx", StringComparison.OrdinalIgnoreCase))
            {
                var fileBytes = _excelReportGenerator.GenerateTeamRosterReport(project);
                await File.WriteAllBytesAsync(filePath, fileBytes);
            }
            else if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
            {
                var fileBytes = _pdfReportGenerator.GenerateTeamRosterPdf(project);
                await File.WriteAllBytesAsync(filePath, fileBytes);
            }

            _logger.LogInformation("Generated team roster for project {ProjectName} at {FilePath}", project.name, filePath);

            _unitOfWork.ReportExports.Add(reportExport);
            await _unitOfWork.SaveChangesAsync();

            return reportExport.id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate team roster report for project {ProjectId}", projectId);
            throw;
        }
    }

    public async Task<long> GenerateActivitySummaryReportAsync(long projectId, DateTime startDate, DateTime endDate, string format)
    {
        try
        {
            var project = await _unitOfWork.Projects.Query()
                .Include(p => p.team_members)
                    .ThenInclude(tm => tm.student_user)
                        .ThenInclude(s => s.user)
                .FirstOrDefaultAsync(p => p.id == projectId);
            if (project == null) throw new NotFoundException("Project not found");

            string fileName = $"project_{projectId}_activity_{DateTime.UtcNow:yyyyMMddHHmmss}.{(format.Equals("excel", StringComparison.OrdinalIgnoreCase) ? "xlsx" : format.ToLower())}";
            string filePath = Path.Combine(GetReportDirectory(), fileName);

            var reportExport = new report_export
            {
                report_type = "ACTIVITY_SUMMARY",
                scope = "PROJECT",
                scope_entity_id = projectId,
                format = format,
                status = "COMPLETED",
                requested_by_user_id = GetCurrentUserId(),
                requested_at = DateTime.UtcNow,
                file_url = $"/reports/{fileName}"
            };

            var activities = await _unitOfWork.StudentActivityDailies.FindAsync(sad =>
                sad.project_id == projectId &&
                sad.activity_date >= DateOnly.FromDateTime(startDate) &&
                sad.activity_date <= DateOnly.FromDateTime(endDate));

            var activityList = activities.GroupBy(a => a.student_user_id)
                .Select(g => new { 
                    StudentId = g.Key, 
                    Commits = g.Sum(x => x.commits_count), 
                    PRs = g.Sum(x => x.pull_requests_count), 
                    Issues = g.Sum(x => x.issues_completed) 
                }).ToList();

            if (format.Equals("excel", StringComparison.OrdinalIgnoreCase) || format.Equals("xlsx", StringComparison.OrdinalIgnoreCase))
            {
                var fileBytes = _excelReportGenerator.GenerateActivitySummaryReport(project, activityList.Cast<dynamic>().ToList());
                await File.WriteAllBytesAsync(filePath, fileBytes);
            }
            else if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
            {
                var fileBytes = _pdfReportGenerator.GenerateActivitySummaryPdf(project, activityList.Cast<dynamic>().ToList());
                await File.WriteAllBytesAsync(filePath, fileBytes);
            }

            _logger.LogInformation("Generated activity summary for project {ProjectName} at {FilePath}", project.name, filePath);

            _unitOfWork.ReportExports.Add(reportExport);
            await _unitOfWork.SaveChangesAsync();

            return reportExport.id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate activity summary for project {ProjectId}", projectId);
            throw;
        }
    }

    public async Task<string?> GetReportFileUrlAsync(long reportExportId)
    {
        var report = await _unitOfWork.ReportExports.GetByIdAsync(reportExportId);
        
        if (report == null || report.status != "COMPLETED")
        {
            return null;
        }

        // Check if expired
        if (report.expires_at.HasValue && report.expires_at.Value < DateTime.UtcNow)
        {
            return null;
        }

        return report.file_url;
    }

    public async Task<List<report_export>> GetUserReportsAsync(long userId)
    {
        var reports = await _unitOfWork.ReportExports.FindAsync(r => r.requested_by_user_id == userId);
        return reports.OrderByDescending(r => r.requested_at).ToList();
    }

    public async Task<long> GenerateSrsReportAsync(long projectId, string format)
    {
        try
        {
            // Load project with team, Jira, and GitHub data
            var project = await _unitOfWork.Projects.Query()
                .Include(p => p.course)
                .Include(p => p.team_members)
                    .ThenInclude(tm => tm.student_user)
                        .ThenInclude(s => s.user)
                .Include(p => p.project_integration)
                    .ThenInclude(pi => pi!.jira_project)
                        .ThenInclude(jp => jp!.jira_issues)
                            .ThenInclude(i => i.jira_issue_linkparent_issues)
                                .ThenInclude(cl => cl.child_issue)
                .Include(p => p.project_integration)
                    .ThenInclude(pi => pi!.github_repo)
                .FirstOrDefaultAsync(p => p.id == projectId);

            if (project == null) throw new NotFoundException("Project not found");

            var integration = project.project_integration;
            if (integration == null || integration.jira_project == null)
                throw new BusinessException("Project is not integrated with Jira. SRS cannot be generated.");

            var jiraProject  = integration.jira_project;
            var githubRepo   = integration.github_repo;
            var allIssues    = jiraProject.jira_issues ?? new List<jira_issue>();

            // GitHub stats
            int totalCommits = 0, totalPRs = 0;
            string? defaultBranch = githubRepo?.default_branch;
            if (githubRepo != null)
            {
                totalCommits = await _unitOfWork.GitHubCommits.Query()
                    .CountAsync(c => c.repo_id == githubRepo.id);
                totalPRs = await _unitOfWork.GitHubPullRequests.Query()
                    .CountAsync(pr => pr.repo_id == githubRepo.id);
            }

            // Classify issues
            var epicAndStoryTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "EPIC", "STORY", "USER STORY" };
            var taskTypes         = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "TASK", "SUB-TASK", "SUBTASK" };
            var nfrKeywords       = new[] { "NFR", "NON-FUNCTIONAL", "SECURITY", "PERFORMANCE", "RELIABILITY" };
            var interfaceKeywords = new[] { "API", "INTERFACE", "UI", "INTEGRATION", "ENDPOINT" };

            var systemFeatures = allIssues
                .Where(i => i.issue_type != null && epicAndStoryTypes.Contains(i.issue_type))
                .OrderBy(i => i.issue_type).ThenBy(i => i.jira_issue_key)
                .Select(i => new SrsFeature
                {
                    IssueKey    = i.jira_issue_key,
                    Title       = i.title ?? "(no title)",
                    Description = i.description,
                    IssueType   = i.issue_type ?? "",
                    Status      = i.status,
                    SubTasks    = allIssues
                        .Where(sub => sub.issue_type != null && taskTypes.Contains(sub.issue_type)
                            && i.jira_issue_linkparent_issues != null
                            && i.jira_issue_linkparent_issues.Any(cl => cl.child_issue_id == sub.id))
                        .Select(sub => new SrsIssueRow
                        {
                            IssueKey    = sub.jira_issue_key,
                            Title       = sub.title ?? "",
                            Description = sub.description,
                            Priority    = sub.priority,
                            Status      = sub.status
                        }).ToList()
                }).ToList();

            var nfrs = allIssues
                .Where(i => i.issue_type?.ToUpper() == "NFR"
                    || nfrKeywords.Any(kw => i.title != null && i.title.Contains(kw, StringComparison.OrdinalIgnoreCase)))
                .Select(i => new SrsIssueRow
                {
                    IssueKey    = i.jira_issue_key,
                    Title       = i.title ?? "",
                    Description = i.description,
                    Priority    = i.priority,
                    Status      = i.status
                }).ToList();

            var externalInterfaces = allIssues
                .Where(i => interfaceKeywords.Any(kw =>
                    (i.title != null && i.title.Contains(kw, StringComparison.OrdinalIgnoreCase))
                    || (i.description != null && i.description.Contains(kw, StringComparison.OrdinalIgnoreCase))))
                .Where(i => nfrs.All(n => n.IssueKey != i.jira_issue_key))
                .Select(i => new SrsIssueRow
                {
                    IssueKey    = i.jira_issue_key,
                    Title       = i.title ?? "",
                    Description = i.description,
                    Priority    = i.priority,
                    Status      = i.status
                }).ToList();

            var teamMembers = project.team_members
                ?.Select(tm => $"{tm.student_user?.user?.full_name ?? "Unknown"} [{tm.student_user?.student_code ?? ""}] — {tm.team_role}")
                .ToList() ?? new List<string>();

            var srsData = new SrsReportData
            {
                Project                  = project,
                JiraProjectKey           = jiraProject.jira_project_key,
                JiraSiteUrl              = jiraProject.jira_url ?? "",
                GithubRepoUrl            = githubRepo?.repo_url ?? "",
                GithubDefaultBranch      = defaultBranch,
                GithubTotalCommits       = totalCommits,
                GithubTotalPRs           = totalPRs,
                TeamMembers              = teamMembers,
                SystemFeatures           = systemFeatures,
                NonFunctionalRequirements = nfrs,
                ExternalInterfaces       = externalInterfaces,
                GeneratedAt              = DateTime.UtcNow
            };

            string fileName = $"project_{projectId}_srs_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
            string filePath = Path.Combine(GetReportDirectory(), fileName);

            var fileBytes = _pdfReportGenerator.GenerateSrsReportPdf(srsData);
            await File.WriteAllBytesAsync(filePath, fileBytes);

            var reportExport = new report_export
            {
                report_type          = "SRS_ISO29148",
                scope                = "PROJECT",
                scope_entity_id      = projectId,
                format               = "pdf",
                status               = "COMPLETED",
                requested_by_user_id = GetCurrentUserId(),
                requested_at         = DateTime.UtcNow,
                file_url             = $"/reports/{fileName}"
            };

            _unitOfWork.ReportExports.Add(reportExport);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation(
                "Generated ISO/IEEE 29148 SRS for Project {ProjectName}: {Features} features, {Nfrs} NFRs",
                project.name, systemFeatures.Count, nfrs.Count);

            return reportExport.id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate SRS report for project {ProjectId}", projectId);
            throw;
        }
    }
}








