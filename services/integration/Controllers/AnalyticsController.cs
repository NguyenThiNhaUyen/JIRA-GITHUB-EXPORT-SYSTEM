using System.Threading.Tasks;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("integrations")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> GetIntegrationStats()
    {
        var result = await _analyticsService.GetIntegrationStatsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("activity")]
    [Authorize(Roles = "ADMIN,LECTURER")]
    public async Task<IActionResult> GetActivityChart()
    {
        var result = await _analyticsService.GetActivityChartAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("teams")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> GetTeamAnalytics()
    {
        var result = await _analyticsService.GetTeamAnalyticsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("audit-logs/recent")]
    [Authorize(Roles = "ADMIN,LECTURER")]
    public async Task<IActionResult> GetRecentAuditLogs([FromQuery] int count = 10)
    {
        var result = await _analyticsService.GetRecentAuditLogsAsync(count);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("courses/{courseId}/radar")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    public async Task<IActionResult> GetGroupRadarMetrics([FromRoute] long courseId)
    {
        var result = await _analyticsService.GetGroupRadarMetricsAsync(courseId);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("lecturer/courses")]
    [Authorize(Roles = "LECTURER")]
    public async Task<IActionResult> GetLecturerCoursesStats()
    {
        // Require Claims/HttpContext extraction
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(userIdStr, out long lecturerId))
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user token"));
        }

        var result = await _analyticsService.GetLecturerCoursesStatsAsync(lecturerId);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }
}
