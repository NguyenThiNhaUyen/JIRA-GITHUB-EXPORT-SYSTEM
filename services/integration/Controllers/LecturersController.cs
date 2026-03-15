using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/lecturers")]
[Authorize]
public class LecturersController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public LecturersController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    /// <summary>
    /// Get lecturer workload (course and student counts)
    /// </summary>
    [HttpGet("{id}/workload")]
    [ProducesResponseType(typeof(ApiResponse<LecturerWorkloadResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWorkload(long id)
    {
        var result = await _analyticsService.GetLecturerWorkloadAsync(id);
        return Ok(ApiResponse<LecturerWorkloadResponse>.SuccessResponse(result));
    }
}
