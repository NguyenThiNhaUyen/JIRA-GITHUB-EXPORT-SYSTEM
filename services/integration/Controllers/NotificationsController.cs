using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(userIdStr, out long userId))
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse("Invalid user token"));
        }

        var result = await _analyticsService.GetRecentNotificationsAsync(userId);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }
}
