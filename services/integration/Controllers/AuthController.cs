using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Auth;
using JiraGithubExport.Shared.Contracts.Responses.Auth;
using Microsoft.AspNetCore.Mvc;

namespace JiraGithubExport.IntegrationService.Controllers;

[ApiController]
[Route("api")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Authenticate and create a session
    /// </summary>
    [HttpPost("sessions")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(ApiResponse<LoginResponse>.SuccessResponse(response, "Login successful"));
        }
        catch (UnauthorizedException ex)
        {
            return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed for {Email}", request.Email);
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred during login"));
        }
    }


    /// <summary>
    /// Authenticate and create a session via Google SSO
    /// </summary>
    [HttpPost("sessions/google")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            var response = await _authService.GoogleLoginAsync(request);
            return Ok(ApiResponse<LoginResponse>.SuccessResponse(response, "Google login successful"));
        }
        catch (UnauthorizedException ex)
        {
            return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google Login failed");
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred during Google authentication"));
        }
    }

    /// <summary>
    /// Request a password reset token (sent to email; returned in dev mode)
    /// </summary>
    [HttpPost("auth/forgot-password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            var token = await _authService.ForgotPasswordAsync(request.Email);
            return Ok(ApiResponse<object>.SuccessResponse(
                new { Message = "If this email exists, a reset link has been sent." },
                "Password reset requested"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ForgotPassword failed");
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred"));
        }
    }

    /// <summary>
    /// Reset password using token received from forgot-password
    /// </summary>
    [HttpPost("auth/reset-password")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
            return Ok(ApiResponse.SuccessResponse("Password has been reset successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ResetPassword failed");
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Refresh an expired access token
    /// </summary>
    [HttpPost("auth/refresh")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshRequest request)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(request);
            return Ok(ApiResponse<LoginResponse>.SuccessResponse(response, "Token refreshed successfully"));
        }
        catch (UnauthorizedException ex)
        {
            return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Refresh token failed");
            return StatusCode(500, ApiResponse.ErrorResponse("An error occurred during token refresh"));
        }
    }
}








