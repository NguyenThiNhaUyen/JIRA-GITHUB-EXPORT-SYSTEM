using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IProjectService
{
    Task<ProjectDetailResponse> CreateProjectAsync(CreateProjectRequest request, long courseId);
    Task<ProjectDetailResponse> GetProjectByIdAsync(long projectId);
    Task<List<ProjectDetailResponse>> GetProjectsByCourseAsync(long courseId);
    Task AddTeamMemberAsync(long projectId, AddTeamMemberRequest request);
    Task RemoveTeamMemberAsync(long projectId, long studentUserId);
    Task LinkIntegrationAsync(long projectId, LinkIntegrationRequest request);
    Task<ProjectDashboardResponse> GetProjectDashboardAsync(long projectId);
}








