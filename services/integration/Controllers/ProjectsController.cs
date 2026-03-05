using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectCoreService _coreService;
    private readonly IProjectTeamService _teamService;
    private readonly IProjectIntegrationService _integrationService;
    private readonly IProjectDashboardService _dashboardService;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(
        IProjectCoreService coreService,
        IProjectTeamService teamService,
        IProjectIntegrationService integrationService,
        IProjectDashboardService dashboardService,
        ILogger<ProjectsController> logger)
    {
        _coreService = coreService;
        _teamService = teamService;
        _integrationService = integrationService;
        _dashboardService = dashboardService;
        _logger = logger;
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.Parse(userIdClaim!);
    }

    /// <summary>
    /// Create a new project
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ProjectDetailResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
    {
        var result = await _coreService.CreateProjectAsync(request, request.CourseId);
        return CreatedAtAction(nameof(GetProjectById), new { projectId = result.Id },
            ApiResponse<ProjectDetailResponse>.SuccessResponse(result, "Project created successfully"));
    }

    /// <summary>
    /// Get project by ID
    /// </summary>
    [HttpGet("{projectId}")]
    [ProducesResponseType(typeof(ApiResponse<ProjectDetailResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectById(long projectId)
    {
        var result = await _coreService.GetProjectByIdAsync(projectId);
        return Ok(ApiResponse<ProjectDetailResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Get project metrics
    /// </summary>
    [HttpGet("{projectId}/metrics")]
    [ProducesResponseType(typeof(ApiResponse<ProjectDashboardResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectDashboard(long projectId)
    {
        var result = await _dashboardService.GetProjectDashboardAsync(projectId);
        return Ok(ApiResponse<ProjectDashboardResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Get all projects for a course
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<ProjectDetailResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectsByCourse([FromQuery] long courseId, [FromQuery] PagedRequest request)
    {
        var result = await _coreService.GetProjectsByCourseAsync(courseId, request);
        return Ok(ApiResponse<PagedResponse<ProjectDetailResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Update a project (Leader/Admin only)
    /// </summary>
    [HttpPut("{projectId}")]
    [ProducesResponseType(typeof(ApiResponse<ProjectDetailResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateProject(long projectId, [FromBody] UpdateProjectRequest request)
    {
        var result = await _coreService.UpdateProjectAsync(projectId, request);
        return Ok(ApiResponse<ProjectDetailResponse>.SuccessResponse(result, "Project updated successfully"));
    }

    /// <summary>
    /// Delete a project (Admin only)
    /// </summary>
    [HttpDelete("{projectId}")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteProject(long projectId)
    {
        await _coreService.DeleteProjectAsync(projectId);
        return Ok(ApiResponse.SuccessResponse("Project deleted successfully"));
    }

    /// <summary>
    /// Add team member to project
    /// </summary>
    [HttpPost("{projectId}/members")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddTeamMember(long projectId, [FromBody] AddTeamMemberRequest request)
    {
        await _teamService.AddTeamMemberAsync(projectId, request);
        return Ok(ApiResponse.SuccessResponse("Team member added successfully"));
    }

    /// <summary>
    /// Remove team member from project
    /// </summary>
    [HttpDelete("{projectId}/members/{studentUserId}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RemoveTeamMember(long projectId, long studentUserId)
    {
        await _teamService.RemoveTeamMemberAsync(projectId, studentUserId);
        return Ok(ApiResponse.SuccessResponse("Team member removed successfully"));
    }

    /// <summary>
    /// Link GitHub and/or Jira integration (Leader submits, status becomes PENDING)
    /// </summary>
    [HttpPost("{projectId}/integrations")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> LinkIntegration(long projectId, [FromBody] LinkIntegrationRequest request)
    {
        var userId = GetCurrentUserId();
        await _integrationService.LinkIntegrationAsync(projectId, userId, request);
        return Ok(ApiResponse.SuccessResponse("Integration submitted. Awaiting lecturer approval."));
    }

    /// <summary>
    /// Approve integration (Lecturer only)
    /// </summary>
    [HttpPost("{projectId}/integrations/approve")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ApproveIntegration(long projectId)
    {
        var userId = GetCurrentUserId();
        await _integrationService.ApproveIntegrationAsync(projectId, userId);
        return Ok(ApiResponse.SuccessResponse("Integration approved. Sync will begin shortly."));
    }

    /// <summary>
    /// Reject integration (Lecturer only)
    /// </summary>
    [HttpPost("{projectId}/integrations/reject")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RejectIntegration(long projectId, [FromBody] RejectIntegrationRequest request)
    {
        var userId = GetCurrentUserId();
        await _integrationService.RejectIntegrationAsync(projectId, userId, request.Reason);
        return Ok(ApiResponse.SuccessResponse("Integration rejected."));
    }

    /// <summary>
    /// Get integration status for a project (all roles)
    /// </summary>
    [HttpGet("{projectId}/integration")]
    [ProducesResponseType(typeof(ApiResponse<IntegrationInfo>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetIntegration(long projectId)
    {
        var result = await _integrationService.GetIntegrationStatusAsync(projectId);
        return Ok(ApiResponse<IntegrationInfo>.SuccessResponse(result));
    }

    /// <summary>
    /// Update contribution score for a team member (Lecturer/Admin only)
    /// </summary>
    [HttpPatch("{projectId}/members/{memberId}/contribution")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateContribution(long projectId, long memberId, [FromBody] UpdateContributionRequest request)
    {
        await _teamService.UpdateContributionScoreAsync(projectId, memberId, request.ContributionScore);
        return Ok(ApiResponse.SuccessResponse("Contribution score updated"));
    }
}








