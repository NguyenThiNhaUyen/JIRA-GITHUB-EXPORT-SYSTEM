using JiraGithubExport.Shared.Contracts.Requests.Projects;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IProjectIntegrationService
{
    Task LinkIntegrationAsync(long projectId, LinkIntegrationRequest request);
}
