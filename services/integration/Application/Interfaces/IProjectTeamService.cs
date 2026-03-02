using JiraGithubExport.Shared.Contracts.Requests.Projects;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IProjectTeamService
{
    Task AddTeamMemberAsync(long projectId, AddTeamMemberRequest request);
    Task RemoveTeamMemberAsync(long projectId, long studentUserId);
}
