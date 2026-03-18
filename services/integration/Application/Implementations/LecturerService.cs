using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class LecturerService : ILecturerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<LecturerService> _logger;

    public LecturerService(IUnitOfWork unitOfWork, ILogger<LecturerService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<List<LecturerCourseStatResponse>> GetLecturerCoursesStatsAsync(long lecturerId)
    {
        var lecturerWithCourses = await _unitOfWork.Lecturers.Query()
            .AsNoTracking()
            .Include(l => l.Courses)
                .ThenInclude(c => c.Subject)
            .Include(l => l.Courses)
                .ThenInclude(c => c.Semester)
            .Include(l => l.Courses)
                .ThenInclude(c => c.Projects)
                    .ThenInclude(p => p.ProjectIntegration)
            .Include(l => l.Courses)
                .ThenInclude(c => c.CourseEnrollments)
                    .ThenInclude(e => e.StudentUser)
                        .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(l => l.UserId == lecturerId);

        var courses = lecturerWithCourses?.Courses.ToList() ?? new List<Course>();
        if (!courses.Any()) return new List<LecturerCourseStatResponse>();

        var result = new List<LecturerCourseStatResponse>();
        var allRepoIds = courses.SelectMany(c => c.Projects)
            .Where(p => p.ProjectIntegration.GithubRepoId != null)
            .Select(p => p.ProjectIntegration.GithubRepoId!.Value)
            .ToList();

        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7).Date;
        var recentCommits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => allRepoIds.Contains(c.RepoId) && c.CommittedAt >= sevenDaysAgo)
            .Select(c => new { c.RepoId, c.CommittedAt })
            .ToListAsync();

        var allDays = new List<string> { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };

        foreach (var course in courses)
        {
            var courseRepoIds = course.Projects
                .Where(p => p.ProjectIntegration.GithubRepoId != null)
                .Select(p => p.ProjectIntegration.GithubRepoId!.Value)
                .ToList();

            var courseCommits = recentCommits.Where(c => courseRepoIds.Contains(c.RepoId)).ToList();
            var chartData = courseCommits
                .GroupBy(c => c.CommittedAt!.Value.Date.DayOfWeek)
                .Select(g => new { Day = g.Key.ToString().Substring(0, 3), Count = g.Count() }).ToList();

            var trends = allDays.Select(day => chartData.FirstOrDefault(c => c.Day == day)?.Count ?? 0).ToList();

            result.Add(new LecturerCourseStatResponse
            {
                Id = course.Id,
                Code = course.CourseCode,
                Name = course.Subject?.SubjectName ?? "Unknown",
                SubjectCode = course.Subject?.SubjectCode ?? "Unknown",
                Semester = course.Semester?.Name ?? "Unknown",
                CurrentStudents = course.CourseEnrollments?.Count ?? 0,
                ProjectsCount = course.Projects?.Count ?? 0,
                ActiveTeams = course.Projects?.Count(p => p.ProjectIntegration.GithubRepoId != null) ?? 0,
                JiraConnected = course.Projects?.Count(p => p.ProjectIntegration.JiraProjectId != null) ?? 0,
                AlertsCount = course.Projects?.Count(p => p.ProjectIntegration?.GithubRepoId == null || p.ProjectIntegration?.JiraProjectId == null) ?? 0,
                Archived = course.Status == "CLOSED",
                LastCommit = courseCommits.Any() ? courseCommits.Max(c => c.CommittedAt) : null,
                Enrollments = course.CourseEnrollments.Where(e => e.Status == "ACTIVE").Select(e => new EnrollmentInfo
                {
                    UserId = e.StudentUserId,
                    FullName = e.StudentUser?.User?.FullName ?? "N/A",
                    StudentCode = e.StudentUser?.StudentCode ?? "N/A",
                    StudentId = e.StudentUser?.StudentCode ?? "N/A"
                }).ToList(),
                CommitTrends = trends
            });
        }
        return result;
    }

    public async Task<LecturerWorkloadResponse> GetLecturerWorkloadAsync(long lecturerId)
    {
        var courseCount = await _unitOfWork.Courses.Query()
            .Where(c => c.LecturerUsers.Any(l => l.UserId == lecturerId))
            .CountAsync();
            
        var studentCount = await _unitOfWork.CourseEnrollments.Query()
            .Where(e => e.Course.LecturerUsers.Any(l => l.UserId == lecturerId) && e.Status == "ACTIVE")
            .CountAsync();

        return new LecturerWorkloadResponse
        {
            CourseCount = courseCount,
            StudentCount = studentCount
        };
    }
}
