using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JiraGithubExport.IntegrationService.Controllers;

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

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<SrsDocumentResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSrsListByCourse(
        [FromQuery] long? courseId, [FromQuery] long? projectId, 
        [FromQuery] string? status, [FromQuery] string? milestone, 
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _srsService.GetSrsListByCourseAsync(courseId, projectId, status, milestone, page, pageSize);
        return Ok(ApiResponse<PagedResponse<SrsDocumentResponse>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<SrsDocumentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSrsById(long id)
    {
        var result = await _srsService.GetSrsByIdAsync(id);
        return Ok(ApiResponse<SrsDocumentResponse>.SuccessResponse(result));
    }

    [HttpPost]
    [Authorize(Roles = "STUDENT,LECTURER,ADMIN")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<SrsDocumentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UploadSrsFlat([FromForm] long projectId, [FromForm] UploadSrsRequest request)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _srsService.UploadSrsAsync(projectId, userId, request);
        return Ok(ApiResponse<SrsDocumentResponse>.SuccessResponse(result, "SRS uploaded successfully"));
    }

    [HttpPost("remind-overdue")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RemindOverdue()
    {
        await _srsService.RemindOverdueAsync();
        return Ok(ApiResponse<object>.SuccessResponse(new { }, "Reminders sent for overdue SRS"));
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

    [HttpPost("{id}/review")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<SrsDocumentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ReviewSrs(long id, [FromBody] ReviewSrsRequest request)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        
        SrsDocumentResponse? result = null;

        if (!string.IsNullOrEmpty(request.Status))
        {
            result = await _srsService.ReviewSrsStatusAsync(id, userId, new ReviewSrsStatusRequest { Status = request.Status, Feedback = request.Feedback });
        }
        
        if (!string.IsNullOrEmpty(request.Feedback) && string.IsNullOrEmpty(request.Status))
        {
            result = await _srsService.ProvideSrsFeedbackAsync(id, userId, new ReviewSrsFeedbackRequest { Feedback = request.Feedback });
        }

        // Add fallback to get it if we didn't receive a result from above
        result ??= await _srsService.GetSrsByIdAsync(id);

        return Ok(ApiResponse<SrsDocumentResponse>.SuccessResponse(result, "SRS reviewed successfully"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "STUDENT,LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteSrs(long id)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        await _srsService.DeleteSrsAsync(id, userId);
        return Ok(ApiResponse<object>.SuccessResponse(new { }, "SRS deleted successfully"));
    }
}

