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
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.Parse(userIdClaim!);
    }

    /// <summary>
    /// Get my reports
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyReports()
    {
        var userId = GetCurrentUserId();
        var result = await _reportService.GetUserReportsAsync(userId);
        return Ok(ApiResponse<object>.SuccessResponse(result));
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
