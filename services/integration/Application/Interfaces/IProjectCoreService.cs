using JiraGithubExportSystem.Shared.Contracts.Common;
using JiraGithubExportSystem.Shared.Contracts.Requests.Projects;
using JiraGithubExportSystem.Shared.Contracts.Responses.Projects;

namespace JiraGithubExportSystem.IntegrationService.Application.Interfaces;

public interface IProjectCoreService
{
    Task<ProjectDetailResponse> CreateProjectAsync(CreateProjectRequest request, long courseId);
    Task<ProjectDetailResponse> UpdateProjectAsync(long projectId, UpdateProjectRequest request);
    Task DeleteProjectAsync(long projectId);
    Task<ProjectDetailResponse> GetProjectByIdAsync(long projectId);
    Task<PagedResponse<ProjectDetailResponse>> GetProjectsByCourseAsync(long courseId, PagedRequest request);
}
