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
<<<<<<< HEAD
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
    {
        _reportService = reportService;
=======
    private readonly ISrsService _srsService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IReportService reportService, ISrsService srsService, ILogger<ReportsController> logger)
    {
        _reportService = reportService;
        _srsService = srsService;
>>>>>>> origin
        _logger = logger;
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.Parse(userIdClaim!);
    }

    /// <summary>
<<<<<<< HEAD
    /// Get my reports
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyReports()
    {
=======
    /// Get my reports or project SRS reports
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetReports([FromQuery] long? projectId, [FromQuery] string? type, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (type == "SRS" && projectId.HasValue)
        {
            var pagedRequest = new PagedRequest { Page = page, PageSize = pageSize };
            var srsResult = await _srsService.GetSrsListAsync(projectId.Value, pagedRequest);
            return Ok(ApiResponse<PagedResponse<JiraGithubExport.Shared.Contracts.Responses.Projects.SrsDocumentResponse>>.SuccessResponse(srsResult));
        }

>>>>>>> origin
        var userId = GetCurrentUserId();
        var result = await _reportService.GetUserReportsAsync(userId);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>
<<<<<<< HEAD
=======
    /// Update SRS review status
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    public async Task<IActionResult> ReviewSrsStatus(long id, [FromBody] JiraGithubExport.Shared.Contracts.Requests.Projects.ReviewSrsStatusRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _srsService.ReviewSrsStatusAsync(id, userId, request);
        return Ok(ApiResponse<JiraGithubExport.Shared.Contracts.Responses.Projects.SrsDocumentResponse>.SuccessResponse(result, "SRS status updated"));
    }

    /// <summary>
>>>>>>> origin
    /// Generate commit statistics report
    /// </summary>
    [HttpPost("commit-statistics")]
    public async Task<IActionResult> GenerateCommitStats([FromQuery] long courseId, [FromQuery] string format = "PDF")
    {
        var reportId = await _reportService.GenerateCommitStatisticsReportAsync(courseId, format);
        return Ok(ApiResponse<object>.SuccessResponse(new { ReportId = reportId }, "Report generation started"));
    }

    /// <summary>
    /// Generate team roster report
    /// </summary>
    [HttpPost("team-roster")]
    public async Task<IActionResult> GenerateTeamRoster([FromQuery] long projectId, [FromQuery] string format = "PDF")
    {
        var reportId = await _reportService.GenerateTeamRosterReportAsync(projectId, format);
        return Ok(ApiResponse<object>.SuccessResponse(new { ReportId = reportId }, "Report generation started"));
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

    /// <summary>
    /// Generate ISO 29148 SRS report from Jira
    /// </summary>
    [HttpPost("srs")]
    public async Task<IActionResult> GenerateSrs([FromQuery] long projectId, [FromQuery] string format = "PDF")
    {
        var reportId = await _reportService.GenerateSrsReportAsync(projectId, format);
        return Ok(ApiResponse<object>.SuccessResponse(new { ReportId = reportId }, "SRS Report generation started"));
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
}
