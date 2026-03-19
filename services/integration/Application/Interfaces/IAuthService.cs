using JiraGithubExportSystem.Shared.Contracts.Requests.Auth;
using JiraGithubExportSystem.Shared.Contracts.Responses.Auth;

namespace JiraGithubExportSystem.IntegrationService.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<LoginResponse> GoogleLoginAsync(GoogleLoginRequest request);
    Task<string> ForgotPasswordAsync(string email); // Returns reset token (dev mode)
    Task ResetPasswordAsync(string token, string newPassword);
}








