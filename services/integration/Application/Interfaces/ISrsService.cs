using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface ISrsService
{
    Task<SrsDocumentResponse> UploadSrsAsync(long projectId, long uploaderUserId, UploadSrsRequest request);
    Task<PagedResponse<SrsDocumentResponse>> GetSrsListAsync(long projectId, PagedRequest request);
    Task<SrsDocumentResponse> ReviewSrsStatusAsync(long srsId, long reviewerUserId, ReviewSrsStatusRequest request);
    Task<SrsDocumentResponse> ProvideSrsFeedbackAsync(long srsId, long reviewerUserId, ReviewSrsFeedbackRequest request);
    Task DeleteSrsAsync(long srsId, long userId);
}
