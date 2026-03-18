using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

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
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,LECTURER,STUDENT")] // Allow student leaders or lecturers/admins
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
        var result = await _dashboardService.GetProjectDashboardAsync(projectId, GetCurrentUserId());
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
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,LECTURER,STUDENT")] // Leader/Lecturer/Admin
    [ProducesResponseType(typeof(ApiResponse<ProjectDetailResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateProject(long projectId, [FromBody] UpdateProjectRequest request)
    {
        var result = await _coreService.UpdateProjectAsync(projectId, request);
        return Ok(ApiResponse<ProjectDetailResponse>.SuccessResponse(result, "Project updated successfully"));
    }

    /// <summary>
    /// Delete a project (Admin/Lecturer only)
    /// </summary>
    [HttpDelete("{projectId}")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,LECTURER")]
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
    [Authorize(Roles = "ADMIN,SUPER_ADMIN,LECTURER,STUDENT")]
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
    [HttpPut("{projectId}/integration")]
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
    [HttpPut("{projectId}/approve-integration")]
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
    [HttpPut("{projectId}/reject-integration")]
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
        if (result == null) return NotFound(ApiResponse<IntegrationInfo>.ErrorResponse("Integration status not found"));
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

    /// <summary>
    /// Get project commits
    /// </summary>
    [HttpGet("{projectId}/commits")]
    [ProducesResponseType(typeof(ApiResponse<List<CommitResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectCommits(long projectId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var result = await _coreService.GetProjectCommitsAsync(projectId, page, pageSize);
        return Ok(ApiResponse<List<CommitResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Get project commit history grouped by student
    /// </summary>
    [HttpGet("{projectId}/commit-history")]
    [ProducesResponseType(typeof(ApiResponse<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentCommitHistoryResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectCommitHistory(long projectId)
    {
        var result = await _coreService.GetProjectCommitHistoryAsync(projectId);
        return Ok(ApiResponse<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentCommitHistoryResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Sync project commits
    /// </summary>
    [HttpPost("{projectId}/sync-commits")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SyncProjectCommits(long projectId)
    {
        var result = await _coreService.SyncProjectCommitsAsync(projectId);
        return Ok(ApiResponse<object>.SuccessResponse(result, "Sync triggered"));
    }

    /// <summary>
    /// Get project kanban board
    /// </summary>
    [HttpGet("{projectId}/kanban")]
    [ProducesResponseType(typeof(ApiResponse<KanbanBoardResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectKanban(long projectId)
    {
        var result = await _dashboardService.GetProjectKanbanAsync(projectId);
        return Ok(ApiResponse<KanbanBoardResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Get project cumulative flow diagram data
    /// </summary>
    [HttpGet("{projectId}/cfd")]
    [ProducesResponseType(typeof(ApiResponse<CfdBoardResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectCfd(long projectId)
    {
        var result = await _dashboardService.GetProjectCfdAsync(projectId);
        return Ok(ApiResponse<CfdBoardResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Get project roadmap/deadlines
    /// </summary>
    [HttpGet("{projectId}/roadmap")]
    [ProducesResponseType(typeof(ApiResponse<RoadmapResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectRoadmap(long projectId)
    {
        var result = await _dashboardService.GetProjectRoadmapAsync(projectId);
        return Ok(ApiResponse<RoadmapResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Get aging WIP tasks
    /// </summary>
    [HttpGet("{projectId}/aging-wip")]
    [ProducesResponseType(typeof(ApiResponse<AgingWipResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectAgingWip(long projectId, [FromQuery] int limit = 5)
    {
        var result = await _dashboardService.GetProjectAgingWipAsync(projectId, limit);
        return Ok(ApiResponse<AgingWipResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Get project cycle time metrics
    /// </summary>
    [HttpGet("{projectId}/cycle-time")]
    [ProducesResponseType(typeof(ApiResponse<CycleTimeResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectCycleTime(long projectId)
    {
        var result = await _dashboardService.GetProjectCycleTimeAsync(projectId);
        return Ok(ApiResponse<CycleTimeResponse>.SuccessResponse(result));
    }
}
