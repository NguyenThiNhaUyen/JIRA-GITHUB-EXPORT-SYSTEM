using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IInvitationService
{
    Task<InvitationResponse> SendInvitationAsync(long projectId, long inviterUserId, CreateInvitationRequest request);
    Task<PagedResponse<InvitationResponse>> GetMyPendingInvitationsAsync(long studentUserId, PagedRequest request);
    Task<InvitationResponse> AcceptInvitationAsync(long invitationId, long studentUserId);
    Task<InvitationResponse> RejectInvitationAsync(long invitationId, long studentUserId);
}

