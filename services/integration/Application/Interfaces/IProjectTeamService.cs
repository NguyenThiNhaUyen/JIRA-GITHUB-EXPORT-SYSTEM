using JiraGithubExportSystem.Shared.Contracts.Requests.Projects;

namespace JiraGithubExportSystem.IntegrationService.Application.Interfaces;

public interface IProjectTeamService
{
    Task AddTeamMemberAsync(long projectId, AddTeamMemberRequest request);
    Task RemoveTeamMemberAsync(long projectId, long studentUserId);
    Task UpdateContributionScoreAsync(long projectId, long memberStudentUserId, decimal? score);
}
