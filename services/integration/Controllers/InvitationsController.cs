using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/projects/{projectId}/invitations")]
public class ProjectInvitationsController : ControllerBase
{
    private readonly IInvitationService _invitationService;

    public ProjectInvitationsController(IInvitationService invitationService)
    {
        _invitationService = invitationService;
    }

    [HttpPost]
    [Authorize(Roles = "STUDENT,LECTURER,ADMIN")] // Usually project leader
    [ProducesResponseType(typeof(ApiResponse<InvitationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SendInvitation(long projectId, [FromBody] CreateInvitationRequest request)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _invitationService.SendInvitationAsync(projectId, userId, request);
        return Ok(ApiResponse<InvitationResponse>.SuccessResponse(result, "Invitation sent successfully"));
    }
}

[ApiController]
[Route("api/invitations")]
public class InvitationsController : ControllerBase
{
    private readonly IInvitationService _invitationService;

    public InvitationsController(IInvitationService invitationService)
    {
        _invitationService = invitationService;
    }

    public class SendInvitationFlatRequest
    {
        public long GroupId { get; set; }
        public long InvitedStudentId { get; set; }
    }

    [HttpPost]
    [Authorize(Roles = "STUDENT,LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<InvitationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SendInvitationFlat([FromBody] SendInvitationFlatRequest request)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var createRequest = new CreateInvitationRequest { StudentUserId = request.InvitedStudentId };
        var result = await _invitationService.SendInvitationAsync(request.GroupId, userId, createRequest);
        return Ok(ApiResponse<InvitationResponse>.SuccessResponse(result, "Invitation sent successfully"));
    }

    [HttpGet("my-pending")]
    [Authorize(Roles = "STUDENT,LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<InvitationResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyPendingInvitations([FromQuery] PagedRequest request)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _invitationService.GetMyPendingInvitationsAsync(userId, request);
        return Ok(ApiResponse<PagedResponse<InvitationResponse>>.SuccessResponse(result));
    }

    [HttpPatch("{id}/accept")]
    [HttpPut("{id}/accept")]
    [Authorize(Roles = "STUDENT")]
    [ProducesResponseType(typeof(ApiResponse<InvitationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> AcceptInvitation(long id)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _invitationService.AcceptInvitationAsync(id, userId);
        return Ok(ApiResponse<InvitationResponse>.SuccessResponse(result, "Invitation accepted"));
    }

    [HttpPatch("{id}/reject")]
    [HttpPut("{id}/decline")]
    [Authorize(Roles = "STUDENT")]
    [ProducesResponseType(typeof(ApiResponse<InvitationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RejectInvitation(long id)
    {
        var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var result = await _invitationService.RejectInvitationAsync(id, userId);
        return Ok(ApiResponse<InvitationResponse>.SuccessResponse(result, "Invitation rejected"));
    }
}
