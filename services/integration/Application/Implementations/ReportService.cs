using System.Security.Claims;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ReportService : IReportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ReportService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IWebHostEnvironment _env;

    public ReportService(IUnitOfWork unitOfWork, ILogger<ReportService> logger, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment env)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _env = env;
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
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Commit Statistics");
                worksheet.Cell(1, 1).Value = "Project Name";
                worksheet.Cell(1, 2).Value = "Student Name";
                worksheet.Cell(1, 3).Value = "Student Code";
                worksheet.Cell(1, 4).Value = "Role";
                
                int row = 2;
                foreach(var p in projects)
                {
                    foreach(var tm in p.team_members)
                    {
                        worksheet.Cell(row, 1).Value = p.name;
                        worksheet.Cell(row, 2).Value = tm.student_user.user.full_name ?? "";
                        worksheet.Cell(row, 3).Value = tm.student_user.student_code;
                        worksheet.Cell(row, 4).Value = tm.team_role;
                        row++;
                    }
                }
                
                worksheet.Columns().AdjustToContents();
                workbook.SaveAs(filePath);
            }
            else if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
            {
                QuestPDF.Fluent.Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.Header().Text($"Commit Statistics - {course.course_name}").SemiBold().FontSize(20);
                        
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
                            
                            foreach(var p in projects)
                            {
                                foreach(var tm in p.team_members)
                                {
                                    table.Cell().Text(p.name);
                                    table.Cell().Text(tm.student_user.user.full_name ?? "");
                                    table.Cell().Text(tm.student_user.student_code);
                                    table.Cell().Text(tm.team_role);
                                }
                            }
                        });
                    });
                }).GeneratePdf(filePath);
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
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Team Roster");
                worksheet.Cell(1, 1).Value = "Student Name";
                worksheet.Cell(1, 2).Value = "Student Code";
                worksheet.Cell(1, 3).Value = "Role";
                
                int row = 2;
                foreach(var tm in project.team_members)
                {
                    worksheet.Cell(row, 1).Value = tm.student_user.user.full_name ?? "";
                    worksheet.Cell(row, 2).Value = tm.student_user.student_code;
                    worksheet.Cell(row, 3).Value = tm.team_role;
                    row++;
                }
                
                worksheet.Columns().AdjustToContents();
                workbook.SaveAs(filePath);
            }
            else if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
            {
                QuestPDF.Fluent.Document.Create(container =>
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
                            
                            foreach(var tm in project.team_members)
                            {
                                table.Cell().Text(tm.student_user.user.full_name ?? "");
                                table.Cell().Text(tm.student_user.student_code);
                                table.Cell().Text(tm.team_role);
                            }
                        });
                    });
                }).GeneratePdf(filePath);
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
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Activity Summary");
                worksheet.Cell(1, 1).Value = "Student Name";
                worksheet.Cell(1, 2).Value = "Student Code";
                worksheet.Cell(1, 3).Value = "Commits";
                worksheet.Cell(1, 4).Value = "Pull Requests";
                worksheet.Cell(1, 5).Value = "Issues Completed";
                
                int row = 2;
                foreach(var tm in project.team_members)
                {
                    var stat = activityList.FirstOrDefault(a => a.StudentId == tm.student_user_id);
                    worksheet.Cell(row, 1).Value = tm.student_user.user.full_name ?? "";
                    worksheet.Cell(row, 2).Value = tm.student_user.student_code;
                    worksheet.Cell(row, 3).Value = stat?.Commits ?? 0;
                    worksheet.Cell(row, 4).Value = stat?.PRs ?? 0;
                    worksheet.Cell(row, 5).Value = stat?.Issues ?? 0;
                    row++;
                }
                
                worksheet.Columns().AdjustToContents();
                workbook.SaveAs(filePath);
            }
            else if (format.Equals("pdf", StringComparison.OrdinalIgnoreCase))
            {
                QuestPDF.Fluent.Document.Create(container =>
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
                            
                            foreach(var tm in project.team_members)
                            {
                                var stat = activityList.FirstOrDefault(a => a.StudentId == tm.student_user_id);
                                table.Cell().Text(tm.student_user.user.full_name ?? "");
                                table.Cell().Text(tm.student_user.student_code);
                                table.Cell().Text((stat?.Commits ?? 0).ToString());
                                table.Cell().Text((stat?.PRs ?? 0).ToString());
                                table.Cell().Text((stat?.Issues ?? 0).ToString());
                            }
                        });
                    });
                }).GeneratePdf(filePath);
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
                QuestPDF.Fluent.Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.Header().Text($"Software Requirements Specification (SRS) - {project.name}").SemiBold().FontSize(20);
                        
                        page.Content().Column(col =>
                        {
                            col.Item().PaddingTop(10).Text("3. System Features").Bold().FontSize(16);
                            foreach(var feat in systemFeatures)
                            {
                                col.Item().PaddingTop(5).Text($"[{feat.jira_issue_key}] {feat.title}").SemiBold().FontSize(12);
                                col.Item().Text(feat.description ?? "No description.").FontSize(10);
                            }

                            col.Item().PaddingTop(15).Text("5. Nonfunctional Requirements").Bold().FontSize(16);
                            foreach(var nfr in nfrs)
                            {
                                col.Item().PaddingTop(5).Text($"[{nfr.jira_issue_key}] {nfr.title}").SemiBold().FontSize(12);
                                col.Item().Text(nfr.description ?? "No description.").FontSize(10);
                            }
                        });
                    });
                }).GeneratePdf(filePath);
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








