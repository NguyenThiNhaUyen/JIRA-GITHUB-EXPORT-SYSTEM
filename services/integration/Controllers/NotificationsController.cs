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
        if (long.TryParse(userIdClaim, out long id)) return id;
        return 0;
    }

    /// <summary>
    /// GET /api/notifications?pageSize=10
    /// Lấy thông báo mới nhất của user hiện tại.
    /// Response: { items, totalCount, page, pageSize }
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyNotifications([FromQuery] int pageSize = 10, [FromQuery] int page = 1)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid token"));

        var all = await _analyticsService.GetRecentNotificationsAsync(userId);

        // Áp dụng pagination
        var totalCount = all.Count;
        var items = all
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            items,
            totalCount,
            page,
            pageSize
        }));
    }

    /// <summary>
    /// PATCH /api/notifications/{id}/read
    /// Đánh dấu đã đọc thông báo.
    /// </summary>
    [HttpPatch("{id}/read")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        await _analyticsService.MarkNotificationAsReadAsync(id);
        return Ok(ApiResponse.SuccessResponse("Notification marked as read"));
    }
}
