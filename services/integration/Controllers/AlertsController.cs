using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/alerts")]
[Authorize]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;

    public AlertsController(IAlertService alertService)
    {
        _alertService = alertService;
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.Parse(userIdClaim!);
    }

    /// <summary>
    /// Get alerts for the current user (filtered by role: Lecturer sees course project alerts, Student sees own project alerts, Admin sees all)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAlerts([FromQuery] PagedRequest request)
    {
        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "STUDENT";
        var result = await _alertService.GetAlertsAsync(userId, userRole, request);
        return Ok(ApiResponse<PagedResponse<AlertResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Mark an alert as resolved (Lecturer/Admin only)
    /// </summary>
    [HttpPatch("{id}/resolve")]
    [Authorize(Roles = "LECTURER,ADMIN")]
    public async Task<IActionResult> ResolveAlert(long id)
    {
        var userId = GetCurrentUserId();
        await _alertService.ResolveAlertAsync(id, userId);
        return Ok(ApiResponse.SuccessResponse("Alert resolved"));
    }
}
