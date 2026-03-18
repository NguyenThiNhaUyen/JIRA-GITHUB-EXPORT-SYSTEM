using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

/// <summary>
/// Student dashboard and personal metrics endpoints.
/// Route: /api/student/*
/// </summary>
[Route("api/student")]
[Authorize(Roles = "STUDENT,ADMIN,SUPER_ADMIN")]
public class StudentController : ApiControllerBase
{
    private readonly IStudentService _studentService;
    private readonly IInvitationService _invitationService;

    public StudentController(IStudentService studentService, IInvitationService invitationService)
    {
        _studentService = studentService;
        _invitationService = invitationService;
    }

    /// <summary>GET /api/student/me/stats â€” Student dashboard overview</summary>
    [HttpGet("me/stats")]
    public async Task<IActionResult> GetMyStats()
    {
        var result = await _studentService.GetStudentDashboardStatsAsync(GetCurrentUserId());
        return Ok(ApiResponse<StudentDashboardStatsResponse>.SuccessResponse(result));
    }

    /// <summary>GET /api/student/me/courses â€” Enrolled courses</summary>
    [HttpGet("me/courses")]
    public async Task<IActionResult> GetMyCourses([FromQuery] PagedRequest request)
    {
        var result = await _studentService.GetStudentCoursesAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<object>>.SuccessResponse(result));
    }

    /// <summary>GET /api/student/me/projects â€” Active team projects</summary>
    [HttpGet("me/projects")]
    public async Task<IActionResult> GetMyProjects([FromQuery] PagedRequest request)
    {
        var result = await _studentService.GetStudentProjectsAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<object>>.SuccessResponse(result));
    }

    /// <summary>GET /api/student/me/invitations â€” Pending team invites</summary>
    [HttpGet("me/invitations")]
    public async Task<IActionResult> GetMyInvitations([FromQuery] PagedRequest request)
    {
        var result = await _invitationService.GetMyPendingInvitationsAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<InvitationResponse>>.SuccessResponse(result));
    }

    /// <summary>GET /api/student/me/commits (Paged)</summary>
    [HttpGet("me/commits")]
    public async Task<IActionResult> GetMyCommits([FromQuery] PagedRequest request)
    {
        var result = await _studentService.GetStudentCommitsAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<object>>.SuccessResponse(result));
    }

    /// <summary>GET /api/student/me/tasks â€” Assigned Jira tasks</summary>
    [HttpGet("me/tasks")]
    public async Task<IActionResult> GetMyTasks([FromQuery] PagedRequest request)
    {
        var result = await _studentService.GetStudentTasksAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<object>>.SuccessResponse(result));
    }

    /// <summary>GET /api/student/me/grades â€” Past SRS grades</summary>
    [HttpGet("me/grades")]
    public async Task<IActionResult> GetMyGrades([FromQuery] PagedRequest request)
    {
        var result = await _studentService.GetStudentGradesAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<object>>.SuccessResponse(result));
    }

    /// <summary>GET /api/student/me/warnings â€” Alerts like missing commits</summary>
    [HttpGet("me/warnings")]
    public async Task<IActionResult> GetMyWarnings()
    {
        var result = await _studentService.GetStudentWarningsAsync(GetCurrentUserId());
        return Ok(ApiResponse<List<object>>.SuccessResponse(result));
    }

    /// <summary>GET /api/student/me/heatmap</summary>
    [HttpGet("me/heatmap")]
    public async Task<IActionResult> GetMyHeatmap([FromQuery] int days = 35)
    {
        var result = await _studentService.GetStudentHeatmapAsync(GetCurrentUserId(), days);
        return Ok(ApiResponse<List<HeatmapStat>>.SuccessResponse(result));
    }

    /// <summary>GET /api/student/me/commit-activity</summary>
    [HttpGet("me/commit-activity")]
    public async Task<IActionResult> GetMyCommitActivity([FromQuery] int days = 7)
    {
        var result = await _studentService.GetStudentCommitActivityAsync(GetCurrentUserId(), days);
        return Ok(ApiResponse<List<DailyCommitStat>>.SuccessResponse(result));
    }

    /// <summary>GET /api/student/me/deadlines â€” Upcoming tasks</summary>
    [HttpGet("me/deadlines")]
    public async Task<IActionResult> GetMyDeadlines()
    {
        var result = await _studentService.GetStudentDeadlinesAsync(GetCurrentUserId());
        return Ok(ApiResponse<List<object>>.SuccessResponse(result));
    }
}
