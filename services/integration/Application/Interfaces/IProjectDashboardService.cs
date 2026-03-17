using JiraGithubExport.Shared.Contracts.Responses.Projects;

namespace JiraGithubExport.IntegrationService.Application.Interfaces;

public interface IProjectDashboardService
{
    Task<ProjectDashboardResponse> GetProjectDashboardAsync(long projectId);
    Task<KanbanBoardResponse> GetProjectKanbanAsync(long projectId);
    Task<CfdBoardResponse> GetProjectCfdAsync(long projectId);
    Task<RoadmapResponse> GetProjectRoadmapAsync(long projectId);
    Task<AgingWipResponse> GetProjectAgingWipAsync(long projectId, int limit = 5);
    Task<CycleTimeResponse> GetProjectCycleTimeAsync(long projectId);
}

public class CycleTimeResponse
{
    public List<CycleTimeBucket> Histogram { get; set; } = new();
    public int MedianDays { get; set; }
    public int P75Days { get; set; }
}

public class CycleTimeBucket
{
    public string Range { get; set; } = null!;
    public int Count { get; set; }
}
