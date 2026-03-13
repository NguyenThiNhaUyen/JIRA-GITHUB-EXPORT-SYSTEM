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
        // Mock data for FE development based on interface constraints
        return new
        {
            coursesCount = await _unitOfWork.CourseEnrollments.Query().CountAsync(e => e.student_user_id == userId),
            projectsCount = await _unitOfWork.TeamMembers.Query().CountAsync(t => t.student_user_id == userId),
            commitsThisWeek = 15,
            srsCompleted = 3,
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
}
