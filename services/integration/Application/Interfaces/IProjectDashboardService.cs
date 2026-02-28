using JiraGithubExport.Shared.Contracts.Responses.Projects;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IProjectDashboardService
{
    Task<ProjectDashboardResponse> GetProjectDashboardAsync(long projectId);
}
