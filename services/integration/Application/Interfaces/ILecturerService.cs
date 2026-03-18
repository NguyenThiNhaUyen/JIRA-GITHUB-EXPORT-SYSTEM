using JiraGithubExport.Shared.Contracts.Responses.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface ILecturerService
{
    Task<List<LecturerCourseStatResponse>> GetLecturerCoursesStatsAsync(long lecturerId);
    Task<LecturerWorkloadResponse> GetLecturerWorkloadAsync(long lecturerId);
}

