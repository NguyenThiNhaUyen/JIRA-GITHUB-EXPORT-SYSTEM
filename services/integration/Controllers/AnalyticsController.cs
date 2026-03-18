using System.Security.Claims;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

/// <summary>
/// Analytics endpoints for Admin and Lecturer dashboards.
/// Route: /api/analytics/*
/// </summary>
[ApiController]
[Route("api/analytics")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    /// <summary>GET /api/analytics/stats — tổng hợp Dashboard Admin</summary>
    [HttpGet("stats")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetAdminStats()
    {
        var result = await _analyticsService.GetAdminStatsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/integration-stats</summary>
    [HttpGet("integration-stats")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetIntegrationStats()
    {
        var result = await _analyticsService.GetIntegrationStatsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/commit-trends?days=7</summary>
    [HttpGet("commit-trends")]
    [Authorize(Roles = "ADMIN,LECTURER")]
    public async Task<IActionResult> GetCommitTrends([FromQuery] int days = 7)
    {
        var result = await _analyticsService.GetCommitTrendsAsync(days);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/heatmap?days=90 — trả về [ { date, count } ]</summary>
    [HttpGet("heatmap")]
    [Authorize(Roles = "ADMIN,LECTURER")]
    public async Task<IActionResult> GetHeatmap([FromQuery] int days = 90)
    {
        var result = await _analyticsService.GetHeatmapAsync(days);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/radar?courseId=1 — Radar chart so sánh nhóm</summary>
    [HttpGet("radar")]
    [Authorize(Roles = "LECTURER,ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetGroupRadarMetrics([FromQuery] long courseId)
    {
        var result = await _analyticsService.GetGroupRadarMetricsAsync(courseId);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/team-rankings?limit=4</summary>
    [HttpGet("team-rankings")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetTeamRankings([FromQuery] int limit = 4)
    {
        var result = await _analyticsService.GetTeamRankingsAsync(limit);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/inactive-teams</summary>
    [HttpGet("inactive-teams")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetInactiveTeams()
    {
        var result = await _analyticsService.GetInactiveTeamsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/team-activities</summary>
    [HttpGet("team-activities")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetTeamActivities()
    {
        var result = await _analyticsService.GetTeamActivitiesAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/activity-log?limit=10</summary>
    [HttpGet("activity-log")]
    [Authorize(Roles = "ADMIN,LECTURER")]
    public async Task<IActionResult> GetRecentAuditLogs([FromQuery] int limit = 10)
    {
        var result = await _analyticsService.GetRecentAuditLogsAsync(limit);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/lecturer/courses — Lecturer workload stats</summary>
    [HttpGet("lecturer/courses")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    public async Task<IActionResult> GetLecturerCoursesStats()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(userIdStr, out long lecturerId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user token"));

        var result = await _analyticsService.GetLecturerCoursesStatsAsync(lecturerId);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/lecturer/activity-logs?limit=10</summary>
    [HttpGet("lecturer/activity-logs")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    public async Task<IActionResult> GetLecturerActivityLogs([FromQuery] int limit = 10)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(userIdStr, out long lecturerId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user token"));

        var result = await _analyticsService.GetLecturerActivityLogsAsync(lecturerId, limit);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/student/stats</summary>
    [HttpGet("student/stats")]
    [Authorize(Roles = "STUDENT,ADMIN")]
    public async Task<IActionResult> GetStudentDashboardStats()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(userIdStr, out long studentUserId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user token"));

        var result = await _analyticsService.GetStudentDashboardStatsAsync(studentUserId);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/student/deadlines</summary>
    [HttpGet("student/deadlines")]
    [Authorize(Roles = "STUDENT,ADMIN")]
    public async Task<IActionResult> GetStudentDeadlines()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(userIdStr, out long studentUserId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user token"));

        var result = await _analyticsService.GetStudentDeadlinesAsync(studentUserId);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/student/me/commit-activity?days=7</summary>
    [HttpGet("student/me/commit-activity")]
    [Authorize(Roles = "STUDENT,ADMIN")]
    public async Task<IActionResult> GetStudentCommitActivity([FromQuery] int days = 7)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(userIdStr, out long studentUserId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user token"));

        var result = await _analyticsService.GetStudentCommitActivityAsync(studentUserId, days);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>GET /api/analytics/courses/{courseId}/contributions</summary>
    [HttpGet("courses/{courseId}/contributions")]
    [Authorize(Roles = "LECTURER,ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetCourseContributions(long courseId)
    {
        var result = await _analyticsService.GetCourseContributionsAsync(courseId);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }
}

/// <summary>
/// Admin-specific bulk operations.
/// Route: /api/admin/*
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "ADMIN,SUPER_ADMIN")]
public class AdminController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AdminController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    /// <summary>POST /api/admin/bulk-assign — Gán GV vào lớp hàng loạt</summary>
    [HttpPost("bulk-assign")]
    public async Task<IActionResult> BulkAssign([FromBody] JiraGithubExport.Shared.Contracts.Requests.Courses.BulkAssignRequest request)
    {
        await _analyticsService.BulkAssignAsync(request);
        return Ok(ApiResponse.SuccessResponse("Bulk assignment completed successfully"));
    }
}
