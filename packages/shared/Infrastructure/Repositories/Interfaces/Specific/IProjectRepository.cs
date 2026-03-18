using JiraGithubExport.Shared.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces.Specific;

public interface IProjectRepository : IGenericRepository<Project>
{
    Task<(IEnumerable<Project> Items, int TotalCount)> GetPagedProjectsByCourseAsync(long courseId, string? keyword, string? sortDir, int page, int pageSize, bool asNoTracking = true);
}

