using JiraGithubExportSystem.Shared.Contracts.Common;
using JiraGithubExportSystem.Shared.Contracts.Requests.Courses;
using JiraGithubExportSystem.Shared.Contracts.Responses.Courses;

namespace JiraGithubExportSystem.IntegrationService.Application.Interfaces;

public interface ISemesterService
{
    Task<SemesterInfo> CreateSemesterAsync(CreateSemesterRequest request);
    Task<SemesterInfo> UpdateSemesterAsync(long semesterId, UpdateSemesterRequest request);
    Task DeleteSemesterAsync(long semesterId);
    Task<PagedResponse<SemesterInfo>> GetAllSemestersAsync(PagedRequest request);
}
