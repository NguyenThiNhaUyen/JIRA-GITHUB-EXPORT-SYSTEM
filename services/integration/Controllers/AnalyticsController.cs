using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

/// <summary>
/// Domain-neutral analytics endpoints such as commit trends, heatmaps, and rankings.
/// Route: /api/analytics/*
/// </summary>
[Route("api/analytics")]
[Authorize]
public class AnalyticsController : ApiControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }


    /// <summary>GET /api/analytics/integration-stats</summary>
    [HttpGet("integration-stats")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<IntegrationStatsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetIntegrationStats()
    {
        var result = await _analyticsService.GetIntegrationStatsAsync();
        return Ok(ApiResponse<IntegrationStatsResponse>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/commit-trends?days=7</summary>
    [HttpGet("commit-trends")]
    [Authorize(Roles = "ADMIN,LECTURER,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<List<DailyCommitStat>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCommitTrends([FromQuery] int days = 7)
    {
        var result = await _analyticsService.GetCommitTrendsAsync(days);
        return Ok(ApiResponse<List<DailyCommitStat>>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/heatmap?days=90</summary>
    [HttpGet("heatmap")]
    [Authorize(Roles = "ADMIN,LECTURER,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<List<HeatmapStat>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHeatmap([FromQuery] int days = 90)
    {
        var result = await _analyticsService.GetHeatmapAsync(days);
        return Ok(ApiResponse<List<HeatmapStat>>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/radar?courseId=1 â€” Team comparison radar chart</summary>
    [HttpGet("radar")]
    [Authorize(Roles = "LECTURER,ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<List<GroupRadarMetricResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGroupRadarMetrics([FromQuery] long courseId)
    {
        var result = await _analyticsService.GetGroupRadarMetricsAsync(courseId);
        return Ok(ApiResponse<List<GroupRadarMetricResponse>>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/team-rankings?limit=4</summary>
    [HttpGet("team-rankings")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<List<TeamRankingStat>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTeamRankings([FromQuery] int limit = 4)
    {
        var result = await _analyticsService.GetTeamRankingsAsync(limit);
        return Ok(ApiResponse<List<TeamRankingStat>>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/inactive-teams</summary>
    [HttpGet("inactive-teams")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<List<TeamWarningStat>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInactiveTeams()
    {
        var result = await _analyticsService.GetInactiveTeamsAsync();
        return Ok(ApiResponse<List<TeamWarningStat>>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/team-activities</summary>
    [HttpGet("team-activities")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<List<DetailedTeamActivityStat>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTeamActivities()
    {
        var result = await _analyticsService.GetTeamActivitiesAsync();
        return Ok(ApiResponse<List<DetailedTeamActivityStat>>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/courses/{courseId}/contributions â€” General course analytics</summary>
    [HttpGet("courses/{courseId}/contributions")]
    [Authorize(Roles = "LECTURER,ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<CourseContributionResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourseContributions(long courseId)
    {
        var result = await _analyticsService.GetCourseContributionsAsync(courseId);
        return Ok(ApiResponse<CourseContributionResponse>.SuccessResponse(result));
    }
}

