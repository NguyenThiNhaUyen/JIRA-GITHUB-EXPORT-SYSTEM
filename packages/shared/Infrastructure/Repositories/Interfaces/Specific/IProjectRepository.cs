using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces.Specific;

public interface IProjectRepository : IGenericRepository<project>
{
    Task<(IEnumerable<project> Items, int TotalCount)> GetPagedProjectsByCourseAsync(long courseId, string? keyword, string? sortDir, int page, int pageSize);
}
