using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

/// <summary>
/// Administrative bulk operations and high-level management.
/// Route: /api/admin/*
/// </summary>
[Route("api/admin")]
[Authorize(Roles = "ADMIN,SUPER_ADMIN")]
public class AdminController : ApiControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    /// <summary>GET /api/admin/stats â€” Admin dashboard stats</summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(ApiResponse<AdminStatsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAdminStats()
    {
        var result = await _adminService.GetAdminStatsAsync();
        return Ok(ApiResponse<AdminStatsResponse>.SuccessResponse(result));
    }

    /// <summary>POST /api/admin/bulk-assign â€” Bulk assign lecturers to courses</summary>
    [HttpPost("bulk-assign")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> BulkAssign([FromBody] BulkAssignRequest request)
    {
        await _adminService.BulkAssignAsync(request);
        return Ok(ApiResponse.SuccessResponse("Bulk assignment completed successfully"));
    }

    /// <summary>GET /api/admin/audit-logs â€” Get global audit logs</summary>
    [HttpGet("audit-logs")]
    [ProducesResponseType(typeof(ApiResponse<List<AuditLogResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int limit = 20)
    {
        var result = await _adminService.GetRecentAuditLogsAsync(limit);
        return Ok(ApiResponse<List<AuditLogResponse>>.SuccessResponse(result));
    }
}
