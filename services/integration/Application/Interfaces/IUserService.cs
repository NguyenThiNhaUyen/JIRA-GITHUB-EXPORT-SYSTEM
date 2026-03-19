using JiraGithubExportSystem.Shared.Contracts.Common;
using JiraGithubExportSystem.Shared.Contracts.Requests.Users;
using JiraGithubExportSystem.Shared.Contracts.Responses.Users;

namespace JiraGithubExportSystem.IntegrationService.Application.Interfaces;

public interface IUserService
{
    Task<PagedResponse<UserDetailResponse>> GetAllUsersAsync(string? role, PagedRequest request);
    Task<UserDetailResponse> GetUserByIdAsync(long userId);
    Task UpdateUserRoleAsync(long userId, string role);
    Task UpdateUserStatusAsync(long userId, bool enabled);
    Task AdminResetPasswordAsync(long userId, string newPassword);
}
