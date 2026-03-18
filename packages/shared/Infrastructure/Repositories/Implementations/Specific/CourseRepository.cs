using Microsoft.EntityFrameworkCore;
using System.Linq;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces.Specific;
using JiraGithubExport.Shared.Infrastructure.Repositories.Implementations;
using JiraGithubExport.Shared.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Implementations.Specific;

public class CourseRepository : GenericRepository<Course>, ICourseRepository
{
    public CourseRepository(JiraGithubToolDbContext context) : base(context)
    {
    }

    private IQueryable<Course> CreatePagedQuery(string? keyword, bool asNoTracking)
    {
        var query = Query(asNoTracking);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var lowerKeyword = keyword.ToLower();
            query = query.Where(c => (c.CourseName ?? "").ToLower().Contains(lowerKeyword) || 
                                     (c.CourseCode ?? "").ToLower().Contains(lowerKeyword));
        }
        
        return query;
    }

    private IQueryable<Course> ApplySorting(IQueryable<Course> query, string? sortDir)
    {
        return sortDir?.ToLower() == "desc" 
            ? query.OrderByDescending(x => x.CreatedAt) 
            : query.OrderBy(x => x.CreatedAt);
    }

    public async Task<(IEnumerable<Course> Items, int TotalCount)> GetPagedCoursesAsync(string? keyword, string? sortDir, int page, int pageSize, bool asNoTracking = true)
    {
        var query = CreatePagedQuery(keyword, asNoTracking);
        query = ApplySorting(query, sortDir);

        var totalItems = await query.CountAsync();
        var items = await query
            .Include(c => c.Subject)
            .Include(c => c.Semester)
            .Include(c => c.LecturerUsers).ThenInclude(l => l.User)
            .Include(c => c.Projects)
            .Include(c => c.CourseEnrollments).ThenInclude(e => e.StudentUser).ThenInclude(s => s.User)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalItems);
    }

    public async Task<(IEnumerable<Course> Items, int TotalCount)> GetPagedCoursesByLecturerAsync(long lecturerUserId, string? keyword, string? sortDir, int page, int pageSize, bool asNoTracking = true)
    {
        var query = CreatePagedQuery(keyword, asNoTracking)
            .Where(c => c.LecturerUsers.Any(l => l.UserId == lecturerUserId));

        query = ApplySorting(query, sortDir);

        var totalItems = await query.CountAsync();
        var items = await query
            .Include(c => c.Subject)
            .Include(c => c.Semester)
            .Include(c => c.LecturerUsers).ThenInclude(l => l.User)
            .Include(c => c.Projects)
            .Include(c => c.CourseEnrollments).ThenInclude(e => e.StudentUser).ThenInclude(s => s.User)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalItems);
    }

    public async Task<(IEnumerable<Course> Items, int TotalCount)> GetPagedCoursesByStudentAsync(long studentUserId, string? keyword, string? sortDir, int page, int pageSize, bool asNoTracking = true)
    {
        var query = CreatePagedQuery(keyword, asNoTracking)
            .Where(c => c.CourseEnrollments.Any(e => e.StudentUserId == studentUserId && e.Status == "ACTIVE"));

        query = ApplySorting(query, sortDir);

        var totalItems = await query.CountAsync();
        var items = await query
            .Include(c => c.Subject)
            .Include(c => c.Semester)
            .Include(c => c.LecturerUsers).ThenInclude(l => l.User)
            .Include(c => c.Projects)
            .Include(c => c.CourseEnrollments).ThenInclude(e => e.StudentUser).ThenInclude(s => s.User)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalItems);
    }
}
