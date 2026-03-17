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
                { "Users", await _context.users.CountAsync() },
                { "Roles", await _context.roles.CountAsync() },
                { "Lecturers", await _context.lecturers.CountAsync() },
                { "Students", await _context.students.CountAsync() },
                { "Semesters", await _context.semesters.CountAsync() },
                { "Subjects", await _context.subjects.CountAsync() },
                { "Courses (Classes)", await _context.courses.CountAsync() },
                { "Course Enrollments", await _context.course_enrollments.CountAsync() },
                { "Projects (Groups)", await _context.projects.CountAsync() },
                { "Team Members", await _context.team_members.CountAsync() },
                { "GitHub Repositories", await _context.github_repositories.CountAsync() },
                { "GitHub Commits", await _context.github_commits.CountAsync() },
                { "Jira Projects", await _context.jira_projects.CountAsync() },
                { "Jira Issues", await _context.jira_issues.CountAsync() },
                { "Daily Activities (For Charts)", await _context.student_activity_dailies.CountAsync() },
                { "Report Exports", await _context.report_exports.CountAsync() }
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
