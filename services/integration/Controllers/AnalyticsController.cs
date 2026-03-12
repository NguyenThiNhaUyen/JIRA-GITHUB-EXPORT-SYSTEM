using System.Threading.Tasks;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize(Roles = "ADMIN")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("integrations")]
    public async Task<IActionResult> GetIntegrationStats()
    {
        var result = await _analyticsService.GetIntegrationStatsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("activity")]
    public async Task<IActionResult> GetActivityChart()
    {
        var result = await _analyticsService.GetActivityChartAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("teams")]
    public async Task<IActionResult> GetTeamAnalytics()
    {
        var result = await _analyticsService.GetTeamAnalyticsAsync();
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("audit-logs/recent")]
    public async Task<IActionResult> GetRecentAuditLogs([FromQuery] int count = 10)
    {
        var result = await _analyticsService.GetRecentAuditLogsAsync(count);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }
}
