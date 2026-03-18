using Microsoft.EntityFrameworkCore;
using System.Linq;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces.Specific;
using JiraGithubExport.Shared.Infrastructure.Repositories.Implementations;
using JiraGithubExport.Shared.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Implementations.Specific;

public class ProjectRepository : GenericRepository<Project>, IProjectRepository
{
    public ProjectRepository(JiraGithubToolDbContext context) : base(context)
    {
    }

    public async Task<(IEnumerable<Project> Items, int TotalCount)> GetPagedProjectsByCourseAsync(long courseId, string? keyword, string? sortDir, int page, int pageSize, bool asNoTracking = true)
    {
        var query = Query(asNoTracking)
            .Where(p => p.CourseId == courseId);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var lowerKeyword = keyword.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(lowerKeyword) || 
                                     (p.Description ?? "").ToLower().Contains(lowerKeyword));
        }

        if (sortDir?.ToLower() == "desc")
            query = query.OrderByDescending(x => x.CreatedAt);
        else
            query = query.OrderBy(x => x.CreatedAt);

        var totalItems = await query.CountAsync();
        var items = await query
            .Include(p => p.ProjectIntegration).ThenInclude(pi => pi.GithubRepo)
            .Include(p => p.ProjectIntegration).ThenInclude(pi => pi.JiraProject)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalItems);
    }
}
