using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/semesters")]
[Authorize]
public class SemestersController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ILogger<SemestersController> _logger;

    public SemestersController(ICourseService courseService, ILogger<SemestersController> logger)
    {
        _courseService = courseService;
        _logger = logger;
    }

    /// <summary>
    /// Get all semesters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<SemesterInfo>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var result = await _courseService.GetAllSemestersAsync();
        return Ok(ApiResponse<List<SemesterInfo>>.SuccessResponse(result));
    }

    /// <summary>
    /// Create a new semester (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<SemesterInfo>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateSemesterRequest request)
    {
        var result = await _courseService.CreateSemesterAsync(request);
        return CreatedAtAction(nameof(GetAll), ApiResponse<SemesterInfo>.SuccessResponse(result, "Semester created successfully"));
    }
}
