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
                var fileBytes = _excelReportGenerator.GenerateCommitStatisticsReport(course.course_name, projects);
                await File.WriteAllBytesAsync(filePath, fileBytes);
            }
            else if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
            {
                var fileBytes = _pdfReportGenerator.GenerateCommitStatisticsPdf(course.course_name, projects);
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
            var project = await _unitOfWork.Projects.Query()
                .Include(p => p.project_integration)
                    .ThenInclude(pi => pi!.jira_project)
                        .ThenInclude(jp => jp!.jira_issues)
                .FirstOrDefaultAsync(p => p.id == projectId);

            if (project == null) throw new NotFoundException("Project not found");
            
            var integration = project.project_integration;
            if (integration == null || integration.jira_project == null) 
                throw new BusinessException("Project is not integrated with Jira. SRS cannot be generated.");

            string fileName = $"project_{projectId}_srs_{DateTime.UtcNow:yyyyMMddHHmmss}.{(format.Equals("pdf", StringComparison.OrdinalIgnoreCase) ? "pdf" : format.ToLower())}";
            string filePath = Path.Combine(GetReportDirectory(), fileName);

            var reportExport = new report_export
            {
                report_type = "SRS_ISO29148",
                scope = "PROJECT",
                scope_entity_id = projectId,
                format = "pdf",
                status = "COMPLETED",
                requested_by_user_id = GetCurrentUserId(), 
                requested_at = DateTime.UtcNow,
                file_url = $"/reports/{fileName}"
            };

            // Logic to organize Jira Data for SRS Sections
            var issues = integration.jira_project.jira_issues;
            
            // Chapter 3: System Features (Epics -> Features)
            var systemFeatures = issues.Where(i => i.issue_type?.ToUpper() == "EPIC" || i.issue_type?.ToUpper() == "STORY")
                                      .OrderBy(i => i.issue_type)
                                      .Select(i => new { i.jira_issue_key, i.title, i.description })
                                      .ToList();

            // Chapter 5: Nonfunctional Requirements (NFR)
            var nfrs = issues.Where(i => i.issue_type?.ToUpper() == "NFR" || (i.title != null && i.title.Contains("NFR", StringComparison.OrdinalIgnoreCase)))
                             .Select(i => new { i.jira_issue_key, i.title, i.description })
                             .ToList();

            _logger.LogInformation("Generating SRS for Project {ProjectName} with {FeatureCount} features and {NfrCount} NFRs", 
                project.name, systemFeatures.Count, nfrs.Count);

            if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase) || true) // SRS defaults to PDF
            {
                var fileBytes = _pdfReportGenerator.GenerateSrsReportPdf(project, systemFeatures.Cast<dynamic>().ToList(), nfrs.Cast<dynamic>().ToList());
                await File.WriteAllBytesAsync(filePath, fileBytes);
            }

            _unitOfWork.ReportExports.Add(reportExport);
            await _unitOfWork.SaveChangesAsync();

            return reportExport.id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate SRS report for project {ProjectId}", projectId);
            throw;
        }
    }
}








