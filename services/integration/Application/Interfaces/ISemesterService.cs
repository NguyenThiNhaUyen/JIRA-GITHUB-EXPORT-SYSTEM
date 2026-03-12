using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Courses;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface ISemesterService
{
    Task<SemesterInfo> CreateSemesterAsync(CreateSemesterRequest request);
    Task<SemesterInfo> UpdateSemesterAsync(long semesterId, UpdateSemesterRequest request);
    Task DeleteSemesterAsync(long semesterId);
    Task<PagedResponse<SemesterInfo>> GetAllSemestersAsync(PagedRequest request);
}
