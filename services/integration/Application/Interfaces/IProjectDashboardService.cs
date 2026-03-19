using JiraGithubExportSystem.Shared.Contracts.Responses.Projects;
using JiraGithubExportSystem.Shared.Contracts.Common;

namespace JiraGithubExportSystem.IntegrationService.Application.Interfaces;

public interface IProjectDashboardService
{
    Task<ProjectDashboardResponse> GetProjectDashboardAsync(long projectId);
    Task<PagedResponse<GitHubCommitResponse>> GetProjectCommitsAsync(long projectId, PagedRequest request);
    Task<PagedResponse<JiraIssueResponse>> GetProjectIssuesAsync(long projectId, PagedRequest request);
    Task<CourseDashboardMetricsResponse> GetCourseProjectsMetricsAsync(long courseId);
}
