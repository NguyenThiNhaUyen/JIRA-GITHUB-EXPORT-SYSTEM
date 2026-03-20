using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces.Specific;

public interface ICourseRepository : IGenericRepository<course>
{
    Task<(IEnumerable<course> Items, int TotalCount)> GetPagedCoursesAsync(string? keyword, string? sortDir, int page, int pageSize);
    Task<(IEnumerable<course> Items, int TotalCount)> GetPagedCoursesByLecturerAsync(long lecturerUserId, string? keyword, string? sortDir, int page, int pageSize);
    Task<(IEnumerable<course> Items, int TotalCount)> GetPagedCoursesByStudentAsync(long studentUserId, string? keyword, string? sortDir, int page, int pageSize);
}
