using System.Threading.Tasks;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/admin")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("stats")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetAdminStats()
    {
        var result = await _analyticsService.GetAdminStatsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("integration-stats")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetIntegrationStats()
    {
        var result = await _analyticsService.GetIntegrationStatsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("commit-trends")]
    [Authorize(Roles = "ADMIN,LECTURER")]
    public async Task<IActionResult> GetCommitTrends([FromQuery] int days = 7)
    {
        var result = await _analyticsService.GetCommitTrendsAsync(days);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("heatmap")]
    [Authorize(Roles = "ADMIN,LECTURER")]
    public async Task<IActionResult> GetHeatmap([FromQuery] int days = 90)
    {
        var result = await _analyticsService.GetHeatmapAsync(days);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("team-rankings")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetTeamRankings([FromQuery] int limit = 4)
    {
        var result = await _analyticsService.GetTeamRankingsAsync(limit);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("inactive-teams")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetInactiveTeams()
    {
        var result = await _analyticsService.GetInactiveTeamsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("team-activities")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetTeamActivities()
    {
        var result = await _analyticsService.GetTeamActivitiesAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("activity-log")]
    [Authorize(Roles = "ADMIN,LECTURER")]
    public async Task<IActionResult> GetRecentAuditLogs([FromQuery] int limit = 10)
    {
        var result = await _analyticsService.GetRecentAuditLogsAsync(limit);
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
