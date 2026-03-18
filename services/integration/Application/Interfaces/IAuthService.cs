using JiraGithubExport.Shared.Contracts.Requests.Auth;
using JiraGithubExport.Shared.Contracts.Responses.Auth;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> GoogleLoginAsync(GoogleLoginRequest request);
    Task<string> ForgotPasswordAsync(string email); // Returns reset token (dev mode)
    Task ResetPasswordAsync(string token, string newPassword);
    Task<LoginResponse> RefreshTokenAsync(RefreshRequest request);
}

