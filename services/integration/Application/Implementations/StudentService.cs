using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class StudentService : IStudentService
{
    private readonly IUnitOfWork _unitOfWork;

    public StudentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<object> GetStudentStatsAsync(long userId)
    {
        var courseCount = await _unitOfWork.CourseEnrollments.Query().CountAsync(e => e.student_user_id == userId && e.status == "ACTIVE");
        var projectCount = await _unitOfWork.TeamMembers.Query().CountAsync(t => t.student_user_id == userId && t.participation_status == "ACTIVE");
        
        // Commits this week
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
        var githubUsernames = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.user_id == userId && ea.provider == "GITHUB")
            .Select(ea => ea.username ?? ea.external_user_key)
            .ToListAsync();

        var commitsThisWeek = await _unitOfWork.GitHubCommits.Query()
            .CountAsync(c => githubUsernames.Contains(c.author_github_user.login) && c.committed_at >= sevenDaysAgo);

        // SRS Completed
        var projectIds = await _unitOfWork.TeamMembers.Query()
            .Where(t => t.student_user_id == userId && t.participation_status == "ACTIVE")
            .Select(t => t.project_id)
            .ToListAsync();
            
        var srsCompleted = await _unitOfWork.ProjectDocuments.Query()
            .CountAsync(d => projectIds.Contains(d.project_id) && d.status == "APPROVED");

        return new
        {
            coursesCount = courseCount,
            projectsCount = projectCount,
            commitsThisWeek = commitsThisWeek,
            srsCompleted = srsCompleted,
            overallScore = 8.5
        };
    }

    public async Task<PagedResponse<object>> GetStudentCoursesAsync(long userId, PagedRequest request)
    {
        var courses = await _unitOfWork.CourseEnrollments.Query()
            .Include(e => e.course)
            .Where(e => e.student_user_id == userId && e.status == "ACTIVE")
            .Select(e => new
            {
                id = e.course.id,
                courseCode = e.course.course_code,
                courseName = e.course.course_name,
                status = e.course.status,
                enrolledAt = e.enrolled_at
            })
            .ToListAsync();

        return new PagedResponse<object>(courses.Cast<object>().ToList(), courses.Count, 1, 100);
    }

    public async Task<PagedResponse<object>> GetStudentProjectsAsync(long userId, PagedRequest request)
    {
        var projects = await _unitOfWork.TeamMembers.Query()
            .Include(t => t.project).ThenInclude(p => p.course)
            .Where(t => t.student_user_id == userId && t.participation_status == "ACTIVE")
            .Select(t => new
            {
                id = t.project.id,
                name = t.project.name,
                courseCode = t.project.course.course_code,
                role = t.team_role,
                status = t.project.status
            })
            .ToListAsync();

        return new PagedResponse<object>(projects.Cast<object>().ToList(), projects.Count, 1, 100);
    }

    public async Task<PagedResponse<object>> GetStudentCommitsAsync(long userId, PagedRequest request)
    {
        await Task.CompletedTask;
        // Mock data
        var commits = new List<object>
        {
            new { id = "abc1234", message = "Fix login bug", createdAt = DateTime.UtcNow.AddDays(-1), additions = 50, deletions = 10 }
        };
        return new PagedResponse<object>(commits, 1, 1, 10);
    }

    public async Task<PagedResponse<object>> GetStudentTasksAsync(long userId, PagedRequest request)
    {
        await Task.CompletedTask;
        // Mock data
        var tasks = new List<object>
        {
            new { id = "TASK-1", title = "Implement API", status = "In Progress", type = "Task", priority = "High" }
        };
        return new PagedResponse<object>(tasks, 1, 1, 10);
    }

    public async Task<PagedResponse<object>> GetStudentGradesAsync(long userId, PagedRequest request)
    {
        await Task.CompletedTask;
        // Mock data
        var grades = new List<object>
        {
            new { courseName = "PRN222", srsVersion = 1, score = 8.5, feedback = "Good job" }
        };
        return new PagedResponse<object>(grades, 1, 1, 10);
    }

    public async Task<List<object>> GetStudentWarningsAsync(long userId)
    {
        await Task.CompletedTask;
        return new List<object>
        {
            new { message = "You have not committed to the Github Repo for 7 days.", severity = "HIGH", courseCode = "PRN222" }
        };
    }

    public async Task<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.HeatmapStat>> GetStudentHeatmapAsync(long userId, int days = 35)
    {
        var since = DateTime.UtcNow.AddDays(-days).Date;
        var githubUsernames = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.user_id == userId && ea.provider == "GITHUB")
            .Select(ea => ea.username ?? ea.external_user_key)
            .ToListAsync();

        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => githubUsernames.Contains(c.author_github_user.login) && c.committed_at >= since)
            .Select(c => new { c.committed_at })
            .ToListAsync();

        return commits
            .Where(c => c.committed_at.HasValue)
            .GroupBy(c => c.committed_at!.Value.Date)
            .Select(g => new JiraGithubExport.Shared.Contracts.Responses.Analytics.HeatmapStat 
            { 
                Date = g.Key.ToString("yyyy-MM-dd"), 
                Count = g.Count() 
            })
            .OrderBy(h => h.Date)
            .ToList();
    }

    public async Task<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.DailyCommitStat>> GetStudentCommitActivityAsync(long userId, int days = 7)
    {
        var since = DateTime.UtcNow.AddDays(-days).Date;
        var githubUsernames = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.user_id == userId && ea.provider == "GITHUB")
            .Select(ea => ea.username ?? ea.external_user_key)
            .ToListAsync();

        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => githubUsernames.Contains(c.author_github_user.login) && c.committed_at >= since)
            .Select(c => new { c.committed_at })
            .ToListAsync();

        var allDays = Enumerable.Range(0, days)
            .Select(i => DateTime.UtcNow.AddDays(-days + i + 1).Date)
            .ToList();

        return allDays.Select(d => new JiraGithubExport.Shared.Contracts.Responses.Analytics.DailyCommitStat
        {
            Day = d.ToString("ddd"),
            Commits = commits.Count(c => c.committed_at.HasValue && c.committed_at.Value.Date == d)
        }).ToList();
    }
}
