using JiraGithubExportSystem.Shared.Models;

namespace JiraGithubExportSystem.Shared.Infrastructure.Repositories.Interfaces.Specific;

public interface IProjectRepository : IGenericRepository<project>
{
    Task<(IEnumerable<project> Items, int TotalCount)> GetPagedProjectsByCourseAsync(long courseId, string? keyword, string? sortDir, int page, int pageSize);
}
