using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

/// <summary>
/// Lecturer-specific operations and statistics.
/// Route: /api/lecturers/*
/// </summary>
[Route("api/lecturers")]
[Authorize]
public class LecturersController : ApiControllerBase
{
    private readonly ILecturerService _lecturerService;
    private readonly IUserService _userService;

    public LecturersController(ILecturerService lecturerService, IUserService userService)
    {
        _lecturerService = lecturerService;
        _userService = userService;
    }

    /// <summary>GET /api/lecturers â€” List lecturers (Admin only)</summary>
    [HttpGet]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetAllLecturers()
    {
        var result = await _userService.GetLecturersAsync();
        return Ok(ApiResponse<List<UserDetailResponse>>.SuccessResponse(result));
    }

    /// <summary>GET /api/lecturers/{id}/workload â€” Lecturer performance summary</summary>
    [HttpGet("{id}/workload")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetWorkload(long id)
    {
        var result = await _lecturerService.GetLecturerWorkloadAsync(id);
        return Ok(ApiResponse<LecturerWorkloadResponse>.SuccessResponse(result));
    }

    /// <summary>GET /api/lecturers/{id}/courses â€” Lecturer course list</summary>
    [HttpGet("{id}/courses")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetLecturerCourses(long id)
    {
        var result = await _lecturerService.GetLecturerCoursesStatsAsync(id);
        return Ok(ApiResponse<List<LecturerCourseStatResponse>>.SuccessResponse(result));
    }

    /// <summary>GET /api/lecturers/me/courses â€” Current lecturer's courses</summary>
    [HttpGet("me/courses")]
    [Authorize(Roles = "LECTURER,ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetMyCourses()
    {
        var lecturerId = GetCurrentUserId();
        if (lecturerId <= 0) return Unauthorized(ApiResponse.ErrorResponse("Invalid user token"));

        var result = await _lecturerService.GetLecturerCoursesStatsAsync(lecturerId);
        return Ok(ApiResponse<List<LecturerCourseStatResponse>>.SuccessResponse(result));
    }

    /// <summary>GET /api/lecturers/me/workload â€” Current lecturer's workload</summary>
    [HttpGet("me/workload")]
    [Authorize(Roles = "LECTURER,ADMIN,SUPER_ADMIN")]
    public async Task<IActionResult> GetMyWorkload()
    {
        var lecturerId = GetCurrentUserId();
        if (lecturerId <= 0) return Unauthorized(ApiResponse.ErrorResponse("Invalid user token"));

        var result = await _lecturerService.GetLecturerWorkloadAsync(lecturerId);
        return Ok(ApiResponse<LecturerWorkloadResponse>.SuccessResponse(result));
    }
}
