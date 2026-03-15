using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Users;
using JiraGithubExport.Shared.Contracts.Responses.Users;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IUserService
{
<<<<<<< HEAD
=======
    Task<List<UserDetailResponse>> GetStudentsAsync();
    Task<List<UserDetailResponse>> GetLecturersAsync();
>>>>>>> origin
    Task<PagedResponse<UserDetailResponse>> GetAllUsersAsync(string? role, PagedRequest request);
    Task<UserDetailResponse> GetUserByIdAsync(long userId);
    Task UpdateUserRoleAsync(long userId, string role);
    Task UpdateUserStatusAsync(long userId, bool enabled);
    Task AdminResetPasswordAsync(long userId, string newPassword);
}
