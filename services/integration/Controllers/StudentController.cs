using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/student")]
[Authorize(Roles = "STUDENT")]
public class StudentController : ControllerBase
{
    private readonly IStudentService _studentService;
    private readonly IInvitationService _invitationService;

    public StudentController(IStudentService studentService, IInvitationService invitationService)
    {
        _studentService = studentService;
        _invitationService = invitationService;
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.Parse(userIdClaim ?? "0");
    }

    [HttpGet("me/stats")]
    public async Task<IActionResult> GetMyStats()
    {
        var result = await _studentService.GetStudentStatsAsync(GetCurrentUserId());
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("me/courses")]
    public async Task<IActionResult> GetMyCourses([FromQuery] PagedRequest request)
    {
        var result = await _studentService.GetStudentCoursesAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<object>>.SuccessResponse(result));
    }

    [HttpGet("me/projects")]
    public async Task<IActionResult> GetMyProjects([FromQuery] PagedRequest request)
    {
        var result = await _studentService.GetStudentProjectsAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<object>>.SuccessResponse(result));
    }

    [HttpGet("me/invitations")]
    public async Task<IActionResult> GetMyInvitations([FromQuery] PagedRequest request)
    {
        var result = await _invitationService.GetMyPendingInvitationsAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<InvitationResponse>>.SuccessResponse(result));
    }

    [HttpGet("me/commits")]
    public async Task<IActionResult> GetMyCommits([FromQuery] PagedRequest request)
    {
        var result = await _studentService.GetStudentCommitsAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<object>>.SuccessResponse(result));
    }

    [HttpGet("me/tasks")]
    public async Task<IActionResult> GetMyTasks([FromQuery] PagedRequest request)
    {
        var result = await _studentService.GetStudentTasksAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<object>>.SuccessResponse(result));
    }

    [HttpGet("me/grades")]
    public async Task<IActionResult> GetMyGrades([FromQuery] PagedRequest request)
    {
        var result = await _studentService.GetStudentGradesAsync(GetCurrentUserId(), request);
        return Ok(ApiResponse<PagedResponse<object>>.SuccessResponse(result));
    }

    [HttpGet("me/warnings")]
    public async Task<IActionResult> GetMyWarnings()
    {
        var result = await _studentService.GetStudentWarningsAsync(GetCurrentUserId());
        return Ok(ApiResponse<List<object>>.SuccessResponse(result));
    }

    [HttpGet("me/heatmap")]
    public async Task<IActionResult> GetMyHeatmap([FromQuery] int days = 35)
    {
        var result = await _studentService.GetStudentHeatmapAsync(GetCurrentUserId(), days);
        return Ok(ApiResponse<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.HeatmapStat>>.SuccessResponse(result));
    }

    [HttpGet("me/commit-activity")]
    public async Task<IActionResult> GetMyCommitActivity([FromQuery] int days = 7)
    {
        var result = await _studentService.GetStudentCommitActivityAsync(GetCurrentUserId(), days);
        return Ok(ApiResponse<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.DailyCommitStat>>.SuccessResponse(result));
    }
}
