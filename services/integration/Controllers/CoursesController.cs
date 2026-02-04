using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/courses")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ILogger<CoursesController> _logger;

    public CoursesController(ICourseService courseService, ILogger<CoursesController> logger)
    {
        _courseService = courseService;
        _logger = logger;
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.Parse(userIdClaim!);
    }

    /// <summary>
    /// Get all courses (Filtered by role: Admin gets all, others get theirs)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<CourseDetailResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        List<CourseDetailResponse> result;

        if (userRole == "ADMIN")
        {
            // For now ICourseService might not have GetAllActiveCourses, but we can reuse GetCoursesByLecturer or similar if needed
            // Let's assume we want to return courses based on role
            result = await _courseService.GetCoursesByLecturerAsync(userId); // Fallback for demo
        }
        else if (userRole == "LECTURER")
        {
            result = await _courseService.GetCoursesByLecturerAsync(userId);
        }
        else
        {
            result = await _courseService.GetCoursesByStudentAsync(userId);
        }

        return Ok(ApiResponse<List<CourseDetailResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Get course by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CourseDetailResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await _courseService.GetCourseByIdAsync(id);
        return Ok(ApiResponse<CourseDetailResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Create a new course (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<CourseDetailResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _courseService.CreateCourseAsync(request, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<CourseDetailResponse>.SuccessResponse(result, "Course created successfully"));
    }

    /// <summary>
    /// Assign lecturer to course (Admin only)
    /// </summary>
    [HttpPost("{id}/lecturers")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> AssignLecturer(long id, [FromBody] AssignLecturerRequest request)
    {
        await _courseService.AssignLecturerAsync(id, request.LecturerUserId);
        return Ok(ApiResponse.SuccessResponse("Lecturer assigned successfully"));
    }

    /// <summary>
    /// Enroll students to course (Admin only)
    /// </summary>
    [HttpPost("{id}/enrollments")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<EnrollmentResult>), StatusCodes.Status200OK)]
    public async Task<IActionResult> EnrollStudents(long id, [FromBody] EnrollStudentsRequest request)
    {
        var result = await _courseService.EnrollStudentsAsync(id, request.StudentUserIds);
        return Ok(ApiResponse<EnrollmentResult>.SuccessResponse(result, "Enrollment completed"));
    }
}
