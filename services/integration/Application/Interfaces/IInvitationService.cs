using JiraGithubExportSystem.Shared.Contracts.Common;
using JiraGithubExportSystem.Shared.Contracts.Requests.Projects;
using JiraGithubExportSystem.Shared.Contracts.Responses.Projects;

namespace JiraGithubExportSystem.IntegrationService.Application.Interfaces;

public interface IInvitationService
{
    Task<InvitationResponse> SendInvitationAsync(long projectId, long inviterUserId, CreateInvitationRequest request);
    Task<PagedResponse<InvitationResponse>> GetMyPendingInvitationsAsync(long studentUserId, PagedRequest request);
    Task<InvitationResponse> AcceptInvitationAsync(long invitationId, long studentUserId);
    Task<InvitationResponse> RejectInvitationAsync(long invitationId, long studentUserId);
}
