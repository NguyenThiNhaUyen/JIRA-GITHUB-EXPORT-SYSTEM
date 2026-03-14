using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Responses.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public NotificationsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    private long GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.Parse(userIdClaim ?? "0");
    }

    /// <summary>
    /// Get recent notifications for the current user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<NotificationResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyNotifications()
    {
        var result = await _analyticsService.GetRecentNotificationsAsync(GetCurrentUserId());
        return Ok(ApiResponse<List<NotificationResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    [HttpPatch("{id}/read")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        await _analyticsService.MarkNotificationAsReadAsync(id);
        return Ok(ApiResponse.SuccessResponse("Notification marked as read"));
    }
}
