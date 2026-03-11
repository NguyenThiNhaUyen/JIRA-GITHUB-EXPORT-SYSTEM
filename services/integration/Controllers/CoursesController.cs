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
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<CourseDetailResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        PagedResponse<CourseDetailResponse> result;

        if (userRole == "ADMIN")
        {
            result = await _courseService.GetAllCoursesAsync(request);
        }
        else if (userRole == "LECTURER")
        {
            result = await _courseService.GetCoursesByLecturerAsync(userId, request);
        }
        else
        {
            result = await _courseService.GetCoursesByStudentAsync(userId, request);
        }

        return Ok(ApiResponse<PagedResponse<CourseDetailResponse>>.SuccessResponse(result));
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
    /// Update a course (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<CourseDetailResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateCourseRequest request)
    {
        var result = await _courseService.UpdateCourseAsync(id, request);
        return Ok(ApiResponse<CourseDetailResponse>.SuccessResponse(result, "Course updated successfully"));
    }

    /// <summary>
    /// Delete a course (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Delete(long id)
    {
        await _courseService.DeleteCourseAsync(id);
        return Ok(ApiResponse.SuccessResponse("Course deleted successfully"));
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

    [HttpPost("{id}/enrollments")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<EnrollmentResult>), StatusCodes.Status200OK)]
    public async Task<IActionResult> EnrollStudents(long id, [FromBody] EnrollStudentsRequest request)
    {
        var result = await _courseService.EnrollStudentsAsync(id, request.StudentUserIds);
        return Ok(ApiResponse<EnrollmentResult>.SuccessResponse(result, "Enrollment completed"));
    }

    [HttpPost("{id}/enrollments/import")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<EnrollmentResult>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ImportEnrollments(long id, IFormFile file)
    {
        try
        {
            _logger.LogInformation("[Import] Starting import for course {CourseId}, file: {FileName}, size: {Size}",
                id, file?.FileName, file?.Length);
            var result = await _courseService.ImportEnrollmentsFromExcelAsync(id, file);
            _logger.LogInformation("[Import] Success: {Enrolled} enrolled", result.EnrolledCount);
            return Ok(ApiResponse<EnrollmentResult>.SuccessResponse(result, "Excel import completed"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Import] FAILED for course {CourseId}: {Message}", id, ex.Message);
            return StatusCode(500, new { error = ex.GetType().Name, message = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    /// <summary>
    /// Get all projects pending integration approval for a course (Lecturer/Admin)
    /// </summary>
    [HttpGet("{id}/pending-integrations")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPendingIntegrations(long id)
    {
        var result = await _courseService.GetPendingIntegrationsAsync(id);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>
    /// Remove a lecturer from a course (Admin only)
    /// </summary>
    [HttpDelete("{id}/lecturers/{lecturerId}")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RemoveLecturer(long id, long lecturerId)
    {
        await _courseService.RemoveLecturerAsync(id, lecturerId);
        return Ok(ApiResponse<object>.SuccessResponse(null, "Lecturer removed from course"));
    }

    /// <summary>
    /// Remove a student enrollment from a course (Admin only)
    /// </summary>
    [HttpDelete("{id}/enrollments/{studentId}")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RemoveEnrollment(long id, long studentId)
    {
        await _courseService.RemoveStudentAsync(id, studentId);
        return Ok(ApiResponse<object>.SuccessResponse(null, "Student removed from course"));
    }
}
