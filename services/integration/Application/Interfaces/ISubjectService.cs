using JiraGithubExportSystem.Shared.Contracts.Common;
using JiraGithubExportSystem.Shared.Contracts.Requests.Courses;
using JiraGithubExportSystem.Shared.Contracts.Responses.Courses;

namespace JiraGithubExportSystem.IntegrationService.Application.Interfaces;

public interface ISubjectService
{
    Task<SubjectInfo> CreateSubjectAsync(CreateSubjectRequest request);
    Task<SubjectInfo> UpdateSubjectAsync(long subjectId, UpdateSubjectRequest request);
    Task DeleteSubjectAsync(long subjectId);
    Task<PagedResponse<SubjectInfo>> GetAllSubjectsAsync(PagedRequest request);
}
