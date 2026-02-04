using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/lecturer/projects")]
[Authorize(Roles = "LECTURER,ADMIN")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(IProjectService projectService, ILogger<ProjectsController> logger)
    {
        _projectService = projectService;
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
        var result = await _projectService.CreateProjectAsync(request, request.CourseId);
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
        var result = await _projectService.GetProjectByIdAsync(projectId);
        return Ok(ApiResponse<ProjectDetailResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Get project dashboard with metrics
    /// </summary>
    [HttpGet("{projectId}/dashboard")]
    [ProducesResponseType(typeof(ApiResponse<ProjectDashboardResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectDashboard(long projectId)
    {
        var result = await _projectService.GetProjectDashboardAsync(projectId);
        return Ok(ApiResponse<ProjectDashboardResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Get all projects for a course
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<ProjectDetailResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjectsByCourse([FromQuery] long courseId)
    {
        var result = await _projectService.GetProjectsByCourseAsync(courseId);
        return Ok(ApiResponse<List<ProjectDetailResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Add team member to project
    /// </summary>
    [HttpPost("{projectId}/members")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddTeamMember(long projectId, [FromBody] AddTeamMemberRequest request)
    {
        await _projectService.AddTeamMemberAsync(projectId, request);
        return Ok(ApiResponse.SuccessResponse("Team member added successfully"));
    }

    /// <summary>
    /// Remove team member from project
    /// </summary>
    [HttpDelete("{projectId}/members/{studentUserId}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> RemoveTeamMember(long projectId, long studentUserId)
    {
        await _projectService.RemoveTeamMemberAsync(projectId, studentUserId);
        return Ok(ApiResponse.SuccessResponse("Team member removed successfully"));
    }

    /// <summary>
    /// Link GitHub and/or Jira integration
    /// </summary>
    [HttpPost("{projectId}/integrations")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> LinkIntegration(long projectId, [FromBody] LinkIntegrationRequest request)
    {
        await _projectService.LinkIntegrationAsync(projectId, request);
        return Ok(ApiResponse.SuccessResponse("Integration linked successfully"));
    }
}








