using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Users;
using JiraGithubExport.Shared.Contracts.Responses.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Get all users (Admin only). Supports ?role=ADMIN|LECTURER|STUDENT filter.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "LECTURER,ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<UserDetailResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] string? role, [FromQuery] PagedRequest request)
    {
        var result = await _userService.GetAllUsersAsync(role, request);
        return Ok(ApiResponse<PagedResponse<UserDetailResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Get user by ID (Admin only)
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "LECTURER,ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse<UserDetailResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await _userService.GetUserByIdAsync(id);
        return Ok(ApiResponse<UserDetailResponse>.SuccessResponse(result));
    }

    /// <summary>
    /// Change user role (Admin only)
    /// </summary>
    [HttpPatch("{id}/role")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateRole(long id, [FromBody] UpdateUserRoleRequest request)
    {
        await _userService.UpdateUserRoleAsync(id, request.Role);
        return Ok(ApiResponse.SuccessResponse("User role updated successfully"));
    }

    /// <summary>
    /// Enable or disable user account (Admin only)
    /// </summary>
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateUserStatusRequest request)
    {
        await _userService.UpdateUserStatusAsync(id, request.Enabled);
        return Ok(ApiResponse.SuccessResponse(request.Enabled ? "User activated" : "User deactivated"));
    }

    /// <summary>
    /// Admin reset password for a user
    /// </summary>
    [HttpPost("{id}/reset-password")]
    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> AdminResetPassword(long id, [FromBody] AdminResetPasswordRequest request)
    {
        await _userService.AdminResetPasswordAsync(id, request.NewPassword);
        return Ok(ApiResponse.SuccessResponse("Password reset successfully"));
    }
}
