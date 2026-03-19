using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JiraGithubExportSystem.IntegrationService.Application.Interfaces;
using JiraGithubExportSystem.Shared.Contracts.Common;

namespace JiraGithubExportSystem.IntegrationService.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/mobile")]
    public class MobileController : ControllerBase
    {
        private readonly IProjectDashboardService _projectDashboardService;

        public MobileController(IProjectDashboardService projectDashboardService)
        {
            _projectDashboardService = projectDashboardService;
        }

        [HttpGet("dashboard/{projectId}")]
        public async Task<IActionResult> GetMobileDashboard(long projectId)
        {
            var result = await _projectDashboardService.GetProjectDashboardAsync(projectId);
            return Ok(ApiResponse<object>.SuccessResponse(result));
        }

        [HttpGet("status")]
        public IActionResult GetSystemStatus()
        {
            return Ok(ApiResponse<object>.SuccessResponse(new { status = "online", version = "1.0.0-mobile-ready" }));
        }
    }
}
