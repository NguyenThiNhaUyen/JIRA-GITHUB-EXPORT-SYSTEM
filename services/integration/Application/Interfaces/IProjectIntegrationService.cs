using JiraGithubExportSystem.Shared.Contracts.Requests.Projects;
using JiraGithubExportSystem.Shared.Contracts.Responses.Projects;

namespace JiraGithubExportSystem.IntegrationService.Application.Interfaces;

public interface IProjectIntegrationService
{
    Task LinkIntegrationAsync(long projectId, long submittedByUserId, LinkIntegrationRequest request);
    Task ApproveIntegrationAsync(long projectId, long approvedByUserId);
    Task RejectIntegrationAsync(long projectId, long rejectedByUserId, string? reason);
    Task<IntegrationInfo?> GetIntegrationStatusAsync(long projectId);
}
