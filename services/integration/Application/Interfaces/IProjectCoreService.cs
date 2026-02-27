using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IProjectCoreService
{
    Task<ProjectDetailResponse> CreateProjectAsync(CreateProjectRequest request, long courseId);
    Task<ProjectDetailResponse> UpdateProjectAsync(long projectId, UpdateProjectRequest request);
    Task DeleteProjectAsync(long projectId);
    Task<ProjectDetailResponse> GetProjectByIdAsync(long projectId);
    Task<PagedResponse<ProjectDetailResponse>> GetProjectsByCourseAsync(long courseId, PagedRequest request);
}
