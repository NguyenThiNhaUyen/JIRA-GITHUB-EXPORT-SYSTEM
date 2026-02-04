using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ReportService : IReportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ReportService> _logger;

    public ReportService(IUnitOfWork unitOfWork, ILogger<ReportService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<long> GenerateCommitStatisticsReportAsync(long courseId, string format)
    {
        try
        {
            var course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.id == courseId);
            if (course == null) throw new NotFoundException("Course not found");

            var reportExport = new report_export
            {
                report_type = "COMMIT_STATISTICS",
                scope = "COURSE",
                scope_entity_id = courseId,
                format = format,
                status = "COMPLETED", // Assuming synchronous for now or mock completion
                requested_by_user_id = 1, // TODO: Get from current user
                requested_at = DateTime.UtcNow,
                file_url = $"/reports/course_{courseId}_commits.{format.ToLower()}"
            };

            // Data gathering logic for statistics (will be used by actual generator)
            var projects = await _unitOfWork.Projects.Query()
                .Include(p => p.team_members)
                    .ThenInclude(tm => tm.student_user)
                        .ThenInclude(s => s.user)
                .Where(p => p.course_id == courseId)
                .ToListAsync();

            _logger.LogInformation("Gathering commit stats for course {CourseName}", course.course_name);

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
            var project = await _unitOfWork.Projects.GetByIdAsync(projectId);
            if (project == null) throw new NotFoundException("Project not found");

            var reportExport = new report_export
            {
                report_type = "TEAM_ROSTER",
                scope = "PROJECT",
                scope_entity_id = projectId,
                format = format,
                status = "COMPLETED",
                requested_by_user_id = 1, 
                requested_at = DateTime.UtcNow,
                file_url = $"/reports/project_{projectId}_roster.{format.ToLower()}"
            };

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
            var project = await _unitOfWork.Projects.GetByIdAsync(projectId);
            if (project == null) throw new NotFoundException("Project not found");

            var reportExport = new report_export
            {
                report_type = "ACTIVITY_SUMMARY",
                scope = "PROJECT",
                scope_entity_id = projectId,
                format = format,
                status = "COMPLETED",
                requested_by_user_id = 1,
                requested_at = DateTime.UtcNow,
                file_url = $"/reports/project_{projectId}_activity.{format.ToLower()}"
            };

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
                    .ThenInclude(pi => pi.jira_project)
                        .ThenInclude(jp => jp.jira_issues)
                .FirstOrDefaultAsync(p => p.id == projectId);

            if (project == null) throw new NotFoundException("Project not found");
            
            var integration = project.project_integration;
            if (integration?.jira_project == null) 
                throw new BusinessException("Project is not integrated with Jira. SRS cannot be generated.");

            var reportExport = new report_export
            {
                report_type = "SRS_ISO29148",
                scope = "PROJECT",
                scope_entity_id = projectId,
                format = format,
                status = "COMPLETED",
                requested_by_user_id = 1, // TODO: Get from context
                requested_at = DateTime.UtcNow,
                file_url = $"/reports/project_{projectId}_srs_{DateTime.UtcNow:yyyyMMdd}.{format.ToLower()}"
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








