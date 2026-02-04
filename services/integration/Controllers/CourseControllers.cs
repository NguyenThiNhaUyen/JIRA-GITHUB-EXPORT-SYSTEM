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
[Route("api/admin")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(ICourseService courseService, ILogger<AdminController> logger)
    {
        _courseService = courseService;
        _logger = logger;
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.Parse(userIdClaim!);
    }

    // ============================================
    // SEMESTER ENDPOINTS
    // ============================================

    /// <summary>
    /// Create a new semester
    /// </summary>
    [HttpPost("semesters")]
    [ProducesResponseType(typeof(ApiResponse<SemesterInfo>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSemester([FromBody] CreateSemesterRequest request)
    {
        var result = await _courseService.CreateSemesterAsync(request);
        return CreatedAtAction(nameof(GetAllSemesters), ApiResponse<SemesterInfo>.SuccessResponse(result, "Semester created successfully"));
    }

    /// <summary>
    /// Get all semesters
    /// </summary>
    [HttpGet("semesters")]
    [ProducesResponseType(typeof(ApiResponse<List<SemesterInfo>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllSemesters()
    {
        var result = await _courseService.GetAllSemestersAsync();
        return Ok(ApiResponse<List<SemesterInfo>>.SuccessResponse(result));
    }

    // ============================================
    // SUBJECT ENDPOINTS
    // ============================================

    /// <summary>
    /// Create a new subject
    /// </summary>
    [HttpPost("subjects")]
    [ProducesResponseType(typeof(ApiResponse<SubjectInfo>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectRequest request)
    {
        var result = await _courseService.CreateSubjectAsync(request);
        return CreatedAtAction(nameof(GetAllSubjects), ApiResponse<SubjectInfo>.SuccessResponse(result, "Subject created successfully"));
    }

    /// <summary>
    /// Get all subjects
    /// </summary>
    [HttpGet("subjects")]
    [ProducesResponseType(typeof(ApiResponse<List<SubjectInfo>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllSubjects()
    {
        var result = await _courseService.GetAllSubjectsAsync();
        return Ok(ApiResponse<List<SubjectInfo>>.SuccessResponse(result));
    }

    // ============================================
    // COURSE ENDPOINTS
    // ============================================

    /// <summary>
    /// Create a new course
    /// </summary>
    [HttpPost("courses")]
    [ProducesResponseType(typeof(ApiResponse<CourseDetailResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _courseService.CreateCourseAsync(request, userId);
        return CreatedAtAction(nameof(GetCourseById), new { courseId = result.Id }, ApiResponse<CourseDetailResponse>.SuccessResponse(result, "Course created successfully"));
    }

    /// <summary>
    /// Get course by ID
    /// </summary>
    [HttpGet("courses/{courseId}")]
    [ProducesResponseType(typeof(ApiResponse<CourseDetailResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourseById(long courseId)
    {
        var result = await _courseService.GetCourseByIdAsync(courseId);
        return Ok(ApiResponse<CourseDetailResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Assign lecturer to course
    /// </summary>
    [HttpPost("courses/{courseId}/lecturers")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> AssignLecturer(long courseId, [FromBody] AssignLecturerRequest request)
    {
        await _courseService.AssignLecturerAsync(courseId, request.LecturerUserId);
        return Ok(ApiResponse.SuccessResponse("Lecturer assigned successfully"));
    }

    /// <summary>
    /// Enroll students to course
    /// </summary>
    [HttpPost("courses/{courseId}/enrollments")]
    [ProducesResponseType(typeof(ApiResponse<EnrollmentResult>), StatusCodes.Status200OK)]
    public async Task<IActionResult> EnrollStudents(long courseId, [FromBody] EnrollStudentsRequest request)
    {
        var result = await _courseService.EnrollStudentsAsync(courseId, request.StudentUserIds);
        return Ok(ApiResponse<EnrollmentResult>.SuccessResponse(result, "Enrollment completed"));
    }
}

// ============================================
// LECTURER CONTROLLER
// ============================================

[ApiController]
[Route("api/lecturer")]
[Authorize(Roles = "LECTURER,ADMIN")]
public class LecturerController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ILogger<LecturerController> _logger;

    public LecturerController(ICourseService courseService, ILogger<LecturerController> logger)
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
    /// Get all courses assigned to current lecturer
    /// </summary>
    [HttpGet("courses")]
    [ProducesResponseType(typeof(ApiResponse<List<CourseDetailResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyCourses()
    {
        var userId = GetCurrentUserId();
        var result = await _courseService.GetCoursesByLecturerAsync(userId);
        return Ok(ApiResponse<List<CourseDetailResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Get course details
    /// </summary>
    [HttpGet("courses/{courseId}")]
    [ProducesResponseType(typeof(ApiResponse<CourseDetailResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourseDetails(long courseId)
    {
        var result = await _courseService.GetCourseByIdAsync(courseId);
        return Ok(ApiResponse<CourseDetailResponse>.SuccessResponse(result));
    }
}

// ============================================
// STUDENT CONTROLLER
// ============================================

[ApiController]
[Route("api/student")]
[Authorize(Roles = "STUDENT")]
public class StudentController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ILogger<StudentController> _logger;

    public StudentController(ICourseService courseService, ILogger<StudentController> logger)
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
    /// Get all courses current student is enrolled in
    /// </summary>
    [HttpGet("courses")]
    [ProducesResponseType(typeof(ApiResponse<List<CourseDetailResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyCourses()
    {
        var userId = GetCurrentUserId();
        var result = await _courseService.GetCoursesByStudentAsync(userId);
        return Ok(ApiResponse<List<CourseDetailResponse>>.SuccessResponse(result));
    }
}








