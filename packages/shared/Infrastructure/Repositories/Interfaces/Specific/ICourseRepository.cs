using JiraGithubExport.Shared.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces.Specific;

public interface ICourseRepository : IGenericRepository<Course>
{
    Task<(IEnumerable<Course> Items, int TotalCount)> GetPagedCoursesAsync(string? keyword, string? sortDir, int page, int pageSize, bool asNoTracking = true);
    Task<(IEnumerable<Course> Items, int TotalCount)> GetPagedCoursesByLecturerAsync(long lecturerUserId, string? keyword, string? sortDir, int page, int pageSize, bool asNoTracking = true);
    Task<(IEnumerable<Course> Items, int TotalCount)> GetPagedCoursesByStudentAsync(long studentUserId, string? keyword, string? sortDir, int page, int pageSize, bool asNoTracking = true);
}
