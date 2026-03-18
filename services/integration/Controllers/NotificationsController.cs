using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

/// <summary>
/// Endpoints for working with system notifications.
/// Route: /api/notifications/*
/// </summary>
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ApiControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    /// <summary>
    /// GET /api/notifications â€” Get notifications for current user with pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyNotifications([FromQuery] int pageSize = 10, [FromQuery] int page = 1)
    {
        var userId = GetCurrentUserId();
        if (userId <= 0) return Unauthorized(ApiResponse.ErrorResponse("Invalid user token"));

        var all = await _notificationService.GetRecentNotificationsAsync(userId);
        
        var totalCount = all.Count;
        var pagedItems = all.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            items = pagedItems,
            totalCount,
            page,
            pageSize
        }));
    }

    /// <summary>
    /// PATCH /api/notifications/{id}/read â€” Mark a notification as read
    /// </summary>
    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        await _notificationService.MarkNotificationAsReadAsync(id);
        return Ok(ApiResponse.SuccessResponse("Notification marked as read"));
    }
}
