using JiraGithubExport.Shared.Contracts.Requests.Projects;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IProjectIntegrationService
{
    Task LinkIntegrationAsync(long projectId, long submittedByUserId, LinkIntegrationRequest request);
    Task ApproveIntegrationAsync(long projectId, long approvedByUserId);
    Task RejectIntegrationAsync(long projectId, long rejectedByUserId, string? reason);
}
