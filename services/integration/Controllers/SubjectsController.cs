using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/subjects")]
[Authorize]
public class SubjectsController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ILogger<SubjectsController> _logger;

    public SubjectsController(ICourseService courseService, ILogger<SubjectsController> logger)
    {
        _courseService = courseService;
        _logger = logger;
    }

    /// <summary>
    /// Get all subjects
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<SubjectInfo>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request)
    {
        var result = await _courseService.GetAllSubjectsAsync(request);
        return Ok(ApiResponse<PagedResponse<SubjectInfo>>.SuccessResponse(result));
    }

    /// <summary>
    /// Create a new subject (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<SubjectInfo>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateSubjectRequest request)
    {
        var result = await _courseService.CreateSubjectAsync(request);
        return CreatedAtAction(nameof(GetAll), ApiResponse<SubjectInfo>.SuccessResponse(result, "Subject created successfully"));
    }

    /// <summary>
    /// Update a subject (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<SubjectInfo>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateSubjectRequest request)
    {
        var result = await _courseService.UpdateSubjectAsync(id, request);
        return Ok(ApiResponse<SubjectInfo>.SuccessResponse(result, "Subject updated successfully"));
    }

    /// <summary>
    /// Delete a subject (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Delete(long id)
    {
        await _courseService.DeleteSubjectAsync(id);
        return Ok(ApiResponse<object>.SuccessResponse(null, "Subject deleted successfully"));
    }
}
