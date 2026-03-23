using JiraGithubExport.Shared.Contracts.Responses.Projects;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IProjectDashboardService
{
    Task<ProjectDashboardResponse> GetProjectDashboardAsync(long projectId, long? userId = null);
    Task<KanbanBoardResponse> GetProjectKanbanAsync(long projectId);
    Task<CfdBoardResponse> GetProjectCfdAsync(long projectId);
    Task<RoadmapResponse> GetProjectRoadmapAsync(long projectId);
    Task<AgingWipResponse> GetProjectAgingWipAsync(long projectId, int limit = 5);
    Task<CycleTimeResponse> GetProjectCycleTimeAsync(long projectId);
}
