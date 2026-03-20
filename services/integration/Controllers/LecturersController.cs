using System.Security.Claims;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

/// <summary>
/// Lecturer management endpoints.
/// Route: /api/lecturers/*
/// </summary>
[ApiController]
[Route("api/lecturers")]
[Authorize]
public class LecturersController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;
    private readonly IUserService _userService;
    private readonly ICourseService _courseService;

    public LecturersController(
        IAnalyticsService analyticsService,
        IUserService userService,
        ICourseService courseService)
    {
        _analyticsService = analyticsService;
        _userService = userService;
        _courseService = courseService;
    }

    /// <summary>
    /// GET /api/lecturers — Danh sách tất cả giảng viên trong hệ thống
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "ADMIN,LECTURER")]
    [ProducesResponseType(typeof(ApiResponse<List<UserDetailResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllLecturers()
    {
        var result = await _userService.GetLecturersAsync();
        return Ok(ApiResponse<List<UserDetailResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// GET /api/lecturers/{id}/workload — Số lớp và số sinh viên của giảng viên
    /// </summary>
    [HttpGet("{id}/workload")]
    [Authorize(Roles = "ADMIN,LECTURER")]
    [ProducesResponseType(typeof(ApiResponse<LecturerWorkloadResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWorkload(long id)
    {
        var result = await _analyticsService.GetLecturerWorkloadAsync(id);
        return Ok(ApiResponse<LecturerWorkloadResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// GET /api/lecturers/{id}/courses — Danh sách lớp học (kèm thống kê) của giảng viên
    /// </summary>
    [HttpGet("{id}/courses")]
    [Authorize(Roles = "ADMIN,LECTURER")]
    [ProducesResponseType(typeof(ApiResponse<List<LecturerCourseStatResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLecturerCourses(long id)
    {
        var result = await _analyticsService.GetLecturerCoursesStatsAsync(id);
        return Ok(ApiResponse<List<LecturerCourseStatResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// GET /api/lecturers/me/courses — Lớp học của chính giảng viên đang đăng nhập
    /// </summary>
    [HttpGet("me/courses")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<List<LecturerCourseStatResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyCourses()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(userIdStr, out long lecturerId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user token"));

        var result = await _analyticsService.GetLecturerCoursesStatsAsync(lecturerId);
        return Ok(ApiResponse<List<LecturerCourseStatResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// GET /api/lecturers/me/workload — Workload của chính giảng viên đang đăng nhập
    /// </summary>
    [HttpGet("me/workload")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<LecturerWorkloadResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyWorkload()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(userIdStr, out long lecturerId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user token"));

        var result = await _analyticsService.GetLecturerWorkloadAsync(lecturerId);
        return Ok(ApiResponse<LecturerWorkloadResponse>.SuccessResponse(result));
    }
}

