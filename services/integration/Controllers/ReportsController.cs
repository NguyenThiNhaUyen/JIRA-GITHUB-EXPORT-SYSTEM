using JiraGithubExport.Shared.Contracts.Responses.Reports;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly ISrsService _srsService;
    private readonly ILogger<ReportsController> _logger;
    private readonly IWebHostEnvironment _env;

    public ReportsController(IReportService reportService, ISrsService srsService, ILogger<ReportsController> logger, IWebHostEnvironment env)
    {
        _reportService = reportService;
        _srsService = srsService;
        _logger = logger;
        _env = env;
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.Parse(userIdClaim!);
    }

    /// <summary>
    /// Get my reports or project SRS reports
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetReports(
        [FromQuery] long? projectId, 
        [FromQuery] long? courseId,
        [FromQuery] string? type, 
        [FromQuery] string? status,
        [FromQuery] string? milestone,
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 50)
    {
        if (type == "SRS")
        {
            var srsResult = await _srsService.GetSrsListByCourseAsync(courseId, projectId, status, milestone, page, pageSize);
            return Ok(ApiResponse<PagedResponse<JiraGithubExport.Shared.Contracts.Responses.Projects.SrsDocumentResponse>>.SuccessResponse(srsResult));
        }

        var userId = GetCurrentUserId();
        var result = await _reportService.GetUserReportsAsync(userId);
        return Ok(ApiResponse<List<ReportExportResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Update SRS review status
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize(Roles = "LECTURER,ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> ReviewSrsStatus(long id, [FromBody] JiraGithubExport.Shared.Contracts.Requests.Projects.ReviewSrsStatusRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _srsService.ReviewSrsStatusAsync(id, userId, request);
        return Ok(ApiResponse<JiraGithubExport.Shared.Contracts.Responses.Projects.SrsDocumentResponse>.SuccessResponse(result, "SRS status updated"));
    }

    /// <summary>
    /// Generate commit statistics report
    /// </summary>
    [HttpPost("commit-statistics")]
    public async Task<IActionResult> GenerateCommitStats([FromQuery] long courseId, [FromQuery] string format = "PDF")
    {
        var reportId = await _reportService.GenerateCommitStatisticsReportAsync(courseId, format);
        return Ok(ApiResponse<object>.SuccessResponse(new { ReportId = reportId }, "Report generation started"));
    }

    [HttpPost("commit-statistics/download")]
    public async Task<IActionResult> DownloadCommitStats([FromQuery] long courseId, [FromQuery] string format = "PDF")
    {
        var reportId = await _reportService.GenerateCommitStatisticsReportAsync(courseId, format);
        return await DownloadByReportId(reportId);
    }

    /// <summary>
    /// Generate team roster report
    /// </summary>
    [HttpPost("team-roster")]
    public async Task<IActionResult> GenerateTeamRoster([FromQuery] long? projectId, [FromQuery] long? courseId, [FromQuery] string format = "PDF")
    {
        if (courseId.HasValue)
        {
            var reportId = await _reportService.GenerateTeamRosterForCourseAsync(courseId.Value, format);
            return Ok(ApiResponse<object>.SuccessResponse(new { ReportId = reportId }, "Course-wide roster generation started"));
        }
        var reportIdProj = await _reportService.GenerateTeamRosterReportAsync(projectId!.Value, format);
        return Ok(ApiResponse<object>.SuccessResponse(new { ReportId = reportIdProj }, "Report generation started"));
    }

    [HttpPost("team-roster/download")]
    public async Task<IActionResult> DownloadTeamRoster([FromQuery] long? projectId, [FromQuery] long? courseId, [FromQuery] string format = "PDF")
    {
        long reportId;
        if (courseId.HasValue)
        {
            reportId = await _reportService.GenerateTeamRosterForCourseAsync(courseId.Value, format);
        }
        else
        {
            reportId = await _reportService.GenerateTeamRosterReportAsync(projectId!.Value, format);
        }
        return await DownloadByReportId(reportId);
    }

    /// <summary>
    /// Generate activity summary report for a project in a date range
    /// </summary>
    [HttpPost("activity-summary")]
    public async Task<IActionResult> GenerateActivitySummary(
        [FromQuery] long projectId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string format = "PDF")
    {
        var reportId = await _reportService.GenerateActivitySummaryReportAsync(projectId, startDate, endDate, format);
        return Ok(ApiResponse<object>.SuccessResponse(new { ReportId = reportId }, "Activity summary report generation started"));
    }

    [HttpPost("activity-summary/download")]
    public async Task<IActionResult> DownloadActivitySummary(
        [FromQuery] long projectId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string format = "PDF")
    {
        var reportId = await _reportService.GenerateActivitySummaryReportAsync(projectId, startDate, endDate, format);
        return await DownloadByReportId(reportId);
    }

    /// <summary>
    /// Generate ISO 29148 SRS report from Jira
    /// </summary>
    [HttpPost("srs")]
    public async Task<IActionResult> GenerateSrs([FromQuery] long? projectId, [FromQuery] long? courseId, [FromQuery] string format = "PDF")
    {
        if (courseId.HasValue)
        {
            var reportId = await _reportService.GenerateSrsForCourseAsync(courseId.Value, format);
            return Ok(ApiResponse<object>.SuccessResponse(new { ReportId = reportId }, "Course-wide SRS generation started"));
        }
        var reportIdProj = await _reportService.GenerateSrsReportAsync(projectId!.Value, format);
        return Ok(ApiResponse<object>.SuccessResponse(new { ReportId = reportIdProj }, "SRS Report generation started"));
    }

    [HttpPost("srs/download")]
    public async Task<IActionResult> DownloadSrs([FromQuery] long? projectId, [FromQuery] long? courseId, [FromQuery] string format = "PDF")
    {
        long reportId;
        if (courseId.HasValue)
        {
            reportId = await _reportService.GenerateSrsForCourseAsync(courseId.Value, format);
        }
        else
        {
            reportId = await _reportService.GenerateSrsReportAsync(projectId!.Value, format);
        }
        return await DownloadByReportId(reportId);
    }

    /// <summary>
    /// Get report download link
    /// </summary>
    [HttpGet("{id}/download-link")]
    public async Task<IActionResult> GetDownloadUrl(long id)
    {
        var url = await _reportService.GetReportFileUrlAsync(id);
        if (url == null) return NotFound(ApiResponse.ErrorResponse("Report not found or not ready"));
        return Ok(ApiResponse<object>.SuccessResponse(new { DownloadUrl = url }));
    }

    private async Task<IActionResult> DownloadByReportId(long reportId)
    {
        var url = await _reportService.GetReportFileUrlAsync(reportId);
        if (string.IsNullOrWhiteSpace(url)) return NotFound(ApiResponse.ErrorResponse("Report not found or not ready"));

        var relative = url;
        if (relative.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            if (Uri.TryCreate(relative, UriKind.Absolute, out var uri))
                relative = uri.AbsolutePath;
        }

        if (!relative.StartsWith("/reports/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(ApiResponse.ErrorResponse("Invalid report file path"));

        var fileName = Path.GetFileName(relative);
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var filePath = Path.Combine(webRoot, "reports", fileName);

        if (!System.IO.File.Exists(filePath))
            return NotFound(ApiResponse.ErrorResponse("Report file not found on server"));

        var contentType = GetContentTypeByExtension(Path.GetExtension(fileName));
        var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
        return File(bytes, contentType, fileName);
    }

    private static string GetContentTypeByExtension(string ext)
    {
        return ext.ToLowerInvariant() switch
        {
            ".pdf" => "application/pdf",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".xls" => "application/vnd.ms-excel",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            _ => "application/octet-stream"
        };
    }
}
