using JiraGithubExportSystem.Shared.Contracts.Responses.Projects;

namespace JiraGithubExportSystem.IntegrationService.Application.Interfaces;

public interface IProjectDashboardService
{
    Task<ProjectDashboardResponse> GetProjectDashboardAsync(long projectId);
}
