using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Courses;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface ISubjectService
{
    Task<SubjectInfo> CreateSubjectAsync(CreateSubjectRequest request);
    Task<SubjectInfo> UpdateSubjectAsync(long subjectId, UpdateSubjectRequest request);
    Task DeleteSubjectAsync(long subjectId);
    Task<PagedResponse<SubjectInfo>> GetAllSubjectsAsync(PagedRequest request);
}
