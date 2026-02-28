using Microsoft.EntityFrameworkCore;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces.Specific;
using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Implementations.Specific;

public class CourseRepository : GenericRepository<course>, ICourseRepository
{
    public CourseRepository(JiraGithubToolDbContext context) : base(context)
    {
    }

    public async Task<(IEnumerable<course> Items, int TotalCount)> GetPagedCoursesAsync(string? keyword, string? sortDir, int page, int pageSize)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var lowerKeyword = keyword.ToLower();
            query = query.Where(c => c.course_name.ToLower().Contains(lowerKeyword) || c.course_code.ToLower().Contains(lowerKeyword));
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

    public async Task<(IEnumerable<course> Items, int TotalCount)> GetPagedCoursesByLecturerAsync(long lecturerUserId, string? keyword, string? sortDir, int page, int pageSize)
    {
        var query = _dbSet.Where(c => c.lecturer_users.Any(l => l.user_id == lecturerUserId));

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var lowerKeyword = keyword.ToLower();
            query = query.Where(c => c.course_name.ToLower().Contains(lowerKeyword) || c.course_code.ToLower().Contains(lowerKeyword));
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

    public async Task<(IEnumerable<course> Items, int TotalCount)> GetPagedCoursesByStudentAsync(long studentUserId, string? keyword, string? sortDir, int page, int pageSize)
    {
        // Must access via CourseEnrollments if needed, or directly from context map
        // Given we are inside CourseRepository, we can join with CourseEnrollments
        var query = _context.Set<course_enrollment>()
            .Where(e => e.student_user_id == studentUserId && e.status == "ACTIVE")
            .Select(e => e.course);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var lowerKeyword = keyword.ToLower();
            query = query.Where(c => c.course_name.ToLower().Contains(lowerKeyword) || c.course_code.ToLower().Contains(lowerKeyword));
        }

        if (sortDir?.ToLower() == "desc")
            query = query.OrderByDescending(x => x.created_at);
        else
            query = query.OrderBy(x => x.created_at);

        var totalItems = await query.CountAsync();
        var items = await query
            .Include(c => c.subject)
            .Include(c => c.semester)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalItems);
    }
}
