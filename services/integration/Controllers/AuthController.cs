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
}








