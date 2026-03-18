using JiraGithubExport.Shared.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JiraGithubExport.IntegrationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DbDiagnosticsController : ControllerBase
    {
        private readonly JiraGithubToolDbContext _context;

        public DbDiagnosticsController(JiraGithubToolDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = new Dictionary<string, int>
            {
                { "Users", await _context.Users.CountAsync() },
                { "Roles", await _context.Roles.CountAsync() },
                { "Lecturers", await _context.Lecturers.CountAsync() },
                { "Students", await _context.Students.CountAsync() },
                { "Semesters", await _context.Semesters.CountAsync() },
                { "Subjects", await _context.Subjects.CountAsync() },
                { "Courses (Classes)", await _context.Courses.CountAsync() },
                { "Course Enrollments", await _context.CourseEnrollments.CountAsync() },
                { "Projects (Groups)", await _context.Projects.CountAsync() },
                { "Team Members", await _context.TeamMembers.CountAsync() },
                { "GitHub Repositories", await _context.GithubRepositories.CountAsync() },
                { "GitHub Commits", await _context.GithubCommits.CountAsync() },
                { "Jira Projects", await _context.JiraProjects.CountAsync() },
                { "Jira Issues", await _context.JiraIssues.CountAsync() },
                { "Daily Activities (For Charts)", await _context.StudentActivityDailies.CountAsync() },
                { "Report Exports", await _context.ReportExports.CountAsync() }
            };

            return Ok(new
            {
                Message = "Database Diagnostic Summary",
                Timestamp = System.DateTime.UtcNow,
                Data = summary,
                Status = summary["Users"] > 0 ? "Data SEEDED" : "EMPTY DATABASE"
            });
        }
    }
}
