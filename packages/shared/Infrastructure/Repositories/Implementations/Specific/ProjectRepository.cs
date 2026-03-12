using Microsoft.EntityFrameworkCore;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces.Specific;
using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Implementations.Specific;

public class ProjectRepository : GenericRepository<project>, IProjectRepository
{
    public ProjectRepository(JiraGithubToolDbContext context) : base(context)
    {
    }

    public async Task<(IEnumerable<project> Items, int TotalCount)> GetPagedProjectsByCourseAsync(long courseId, string? keyword, string? sortDir, int page, int pageSize)
    {
        var query = _dbSet.Where(p => p.course_id == courseId && p.status == "ACTIVE");

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var lowerKeyword = keyword.ToLower();
            query = query.Where(p => p.name.ToLower().Contains(lowerKeyword));
        }

        if (sortDir?.ToLower() == "desc")
            query = query.OrderByDescending(x => x.created_at);
        else
            query = query.OrderBy(x => x.created_at);

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalItems);
    }
}
