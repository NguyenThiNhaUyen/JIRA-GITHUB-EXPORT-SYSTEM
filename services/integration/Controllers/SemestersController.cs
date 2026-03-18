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
    private readonly ISemesterService _semesterService;

    public SemestersController(ISemesterService semesterService)
    {
        _semesterService = semesterService;
    }

    /// <summary>
    /// Get all semesters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<SemesterInfo>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] PagedRequest request)
    {
        var result = await _semesterService.GetAllSemestersAsync(request);
        return Ok(ApiResponse<PagedResponse<SemesterInfo>>.SuccessResponse(result));
    }

    /// <summary>
    /// Get all semesters (unpaged)
    /// </summary>
    [HttpGet("all")]
    [ProducesResponseType(typeof(ApiResponse<List<SemesterInfo>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllUnpaged()
    {
        var result = await _semesterService.GetAllSemestersAsync();
        return Ok(ApiResponse<List<SemesterInfo>>.SuccessResponse(result));
    }

    /// <summary>
    /// Create a new semester (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<SemesterInfo>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateSemesterRequest request)
    {
        var result = await _semesterService.CreateSemesterAsync(request);
        return CreatedAtAction(nameof(GetAll), ApiResponse<SemesterInfo>.SuccessResponse(result, "Semester created successfully"));
    }

    /// <summary>
    /// Auto-generate Spring, Summer, and Fall semesters for a given year (Admin only)
    /// </summary>
    [HttpPost("generate")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<List<SemesterInfo>>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Generate([FromBody] GenerateSemestersRequest request)
    {
        var result = await _semesterService.GenerateSemestersAsync(request);
        return Ok(ApiResponse<List<SemesterInfo>>.SuccessResponse(result, $"Semesters for {request.Year} generated successfully"));
    }

    /// <summary>
    /// Update a semester (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<SemesterInfo>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateSemesterRequest request)
    {
        var result = await _semesterService.UpdateSemesterAsync(id, request);
        return Ok(ApiResponse<SemesterInfo>.SuccessResponse(result, "Semester updated successfully"));
    }

    /// <summary>
    /// Delete a semester (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Delete(long id)
    {
        await _semesterService.DeleteSemesterAsync(id);
        return Ok(ApiResponse.SuccessResponse("Semester deleted successfully"));
    }
}

