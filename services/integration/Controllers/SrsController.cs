using JiraGithubExportSystem.IntegrationService.Application.Interfaces;
using JiraGithubExportSystem.Shared.Contracts.Common;
using JiraGithubExportSystem.Shared.Contracts.Requests.Projects;
using JiraGithubExportSystem.Shared.Contracts.Responses.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JiraGithubExportSystem.IntegrationService.Controllers;

[ApiController]
[Route("api/projects/{projectId}/srs")]
public class ProjectSrsController : ControllerBase
{
    private readonly ISrsService _srsService;

    public ProjectSrsController(ISrsService srsService)
    {
        _srsService = srsService;
    }

    [HttpPost]
    [Authorize(Roles = "STUDENT,LECTURER,ADMIN")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<SrsDocumentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UploadSrs(long projectId, [FromForm] UploadSrsRequest request)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _srsService.UploadSrsAsync(projectId, userId, request);
        return Ok(ApiResponse<SrsDocumentResponse>.SuccessResponse(result, "SRS uploaded successfully"));
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<SrsDocumentResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSrsList(long projectId, [FromQuery] PagedRequest request)
    {
        var result = await _srsService.GetSrsListAsync(projectId, request);
        return Ok(ApiResponse<PagedResponse<SrsDocumentResponse>>.SuccessResponse(result));
    }
}

[ApiController]
[Route("api/srs")]
public class SrsController : ControllerBase
{
    private readonly ISrsService _srsService;

    public SrsController(ISrsService srsService)
    {
        _srsService = srsService;
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<SrsDocumentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ReviewStatus(long id, [FromBody] ReviewSrsStatusRequest request)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _srsService.ReviewSrsStatusAsync(id, userId, request);
        return Ok(ApiResponse<SrsDocumentResponse>.SuccessResponse(result, "SRS status updated"));
    }

    [HttpPatch("{id}/feedback")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<SrsDocumentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ProvideFeedback(long id, [FromBody] ReviewSrsFeedbackRequest request)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _srsService.ProvideSrsFeedbackAsync(id, userId, request);
        return Ok(ApiResponse<SrsDocumentResponse>.SuccessResponse(result, "Feedback added"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "STUDENT,LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteSrs(long id)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        await _srsService.DeleteSrsAsync(id, userId);
        return Ok(ApiResponse<object>.SuccessResponse(null, "SRS deleted successfully"));
    }
}
