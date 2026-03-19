using JiraGithubExportSystem.Shared.Contracts.Common;
using JiraGithubExportSystem.Shared.Contracts.Requests.Projects;
using JiraGithubExportSystem.Shared.Contracts.Responses.Projects;

namespace JiraGithubExportSystem.IntegrationService.Application.Interfaces;

public interface ISrsService
{
    Task<SrsDocumentResponse> UploadSrsAsync(long projectId, long uploaderUserId, UploadSrsRequest request);
    Task<PagedResponse<SrsDocumentResponse>> GetSrsListAsync(long projectId, PagedRequest request);
    Task<SrsDocumentResponse> ReviewSrsStatusAsync(long srsId, long reviewerUserId, ReviewSrsStatusRequest request);
    Task<SrsDocumentResponse> ProvideSrsFeedbackAsync(long srsId, long reviewerUserId, ReviewSrsFeedbackRequest request);
    Task DeleteSrsAsync(long srsId, long userId);
}
