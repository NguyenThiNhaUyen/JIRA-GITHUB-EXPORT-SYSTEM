using JiraGithubExportSystem.Shared.Contracts.Common;
using JiraGithubExportSystem.Shared.Models;
using JiraGithubExportSystem.Shared.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JiraGithubExportSystem.IntegrationService.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "ADMIN")]
public class DashboardController : ControllerBase
{
    private readonly JiraGithubToolDbContext _context;

    public DashboardController(JiraGithubToolDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetSystemStats()
    {
        var totalCourses = await _context.courses.CountAsync();
        var totalSubjects = await _context.subjects.CountAsync();
        var totalProjects = await _context.projects.CountAsync();
        var totalStudents = await _context.students.CountAsync();
        var totalLecturers = await _context.lecturers.CountAsync();

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new
            {
                TotalCourses = totalCourses,
                TotalSubjects = totalSubjects,
                TotalProjects = totalProjects,
                TotalStudents = totalStudents,
                TotalLecturers = totalLecturers
            }
        });
    }
}
