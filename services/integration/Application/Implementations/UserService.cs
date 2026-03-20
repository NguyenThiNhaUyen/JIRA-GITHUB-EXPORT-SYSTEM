using System.Collections.Generic;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Users;
using JiraGithubExport.Shared.Contracts.Responses.Users;
using JiraGithubExport.Shared.Infrastructure.Identity.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class UserService : IUserService
{
    private readonly JiraGithubToolDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<UserService> _logger;

    public UserService(JiraGithubToolDbContext context, IPasswordHasher passwordHasher, ILogger<UserService> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<List<UserDetailResponse>> GetStudentsAsync()
    {
        var users = await _context.users
            .Include(u => u.roles)
            .Include(u => u.student)
            .Where(u => u.roles.Any(r => r.role_name == "STUDENT"))
            .ToListAsync();
        return users.Select(MapToResponse).ToList();
    }

    public async Task<List<UserDetailResponse>> GetLecturersAsync()
    {
        var users = await _context.users
            .Include(u => u.roles)
            .Include(u => u.lecturer)
            .Where(u => u.roles.Any(r => r.role_name == "LECTURER"))
            .ToListAsync();
        return users.Select(MapToResponse).ToList();
    }

    public async Task<PagedResponse<UserDetailResponse>> GetAllUsersAsync(string? role, PagedRequest request)
    {
        var query = _context.users
            .Include(u => u.roles)
            .Include(u => u.student)
            .Include(u => u.lecturer)
            .AsQueryable();

        if (!string.IsNullOrEmpty(role))
        {
            query = query.Where(u => u.roles.Any(r => r.role_name == role.ToUpper()));
        }

        var total = await query.CountAsync();
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 20;
        var items = await query
            .OrderByDescending(u => u.created_at)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var mapped = items.Select(MapToResponse).ToList();

        return new PagedResponse<UserDetailResponse>
        {
            Items = mapped,
            TotalCount = total,
            TotalItems = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task<UserDetailResponse> GetUserByIdAsync(long userId)
    {
        var user = await _context.users
            .Include(u => u.roles)
            .Include(u => u.student)
            .Include(u => u.lecturer)
            .FirstOrDefaultAsync(u => u.id == userId)
            ?? throw new NotFoundException($"User {userId} not found");

        return MapToResponse(user);
    }

    public async Task UpdateUserRoleAsync(long userId, string role)
    {
        var user = await _context.users
            .Include(u => u.roles)
            .FirstOrDefaultAsync(u => u.id == userId)
            ?? throw new NotFoundException($"User {userId} not found");

        // Remove existing roles and set new role
        user.roles.Clear();
        var roleEntity = await _context.roles.FirstOrDefaultAsync(r => r.role_name == role.ToUpper())
            ?? throw new NotFoundException($"Role '{role}' not found");
        user.roles.Add(roleEntity);

        await _context.SaveChangesAsync();
    }

    public async Task UpdateUserStatusAsync(long userId, bool enabled)
    {
        var user = await _context.users.FindAsync(userId)
            ?? throw new NotFoundException($"User {userId} not found");

        user.enabled = enabled;
        user.updated_at = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task AdminResetPasswordAsync(long userId, string newPassword)
    {
        var user = await _context.users.FindAsync(userId)
            ?? throw new NotFoundException($"User {userId} not found");

        user.password = _passwordHasher.HashPassword(newPassword);
        user.updated_at = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private static UserDetailResponse MapToResponse(user u) => new()
    {
        Id = u.id,
        Email = u.email,
        FullName = u.full_name,
        Enabled = u.enabled,
        Roles = u.roles.Select(r => r.role_name).ToList(),
        Role = u.roles.Any(r => r.role_name.ToUpper() == "ADMIN") ? "ADMIN" : (u.roles.Any(r => r.role_name.ToUpper() == "LECTURER") ? "LECTURER" : "STUDENT"),
        StudentCode = u.student?.student_code,
        StudentId = u.student?.student_code,
        LecturerCode = u.lecturer?.lecturer_code,
        Department = u.lecturer?.department ?? u.student?.department,
        AssignedCourses = u.lecturer?.courses?.Select(c => c.course_code).ToList() ?? new List<string>(),
        CreatedAt = u.created_at
    };

    public async Task<UserDetailResponse> CreateUserAsync(CreateUserRequest request)
    {
        var existingUser = await _context.users.FirstOrDefaultAsync(u => u.email == request.Email);
        if (existingUser != null)
        {
            throw new BusinessException($"User with email {request.Email} already exists.");
        }

        var roleName = request.Role?.ToUpper() ?? "STUDENT";
        var role = await _context.roles.FirstOrDefaultAsync(r => r.role_name == roleName);
        if (role == null)
        {
            role = new role { role_name = roleName };
            _context.roles.Add(role);
        }

        var user = new user
        {
            email = request.Email,
            full_name = request.FullName,
            password = _passwordHasher.HashPassword("Admin@123"),
            enabled = true,
            created_at = DateTime.UtcNow,
            updated_at = DateTime.UtcNow
        };

        user.roles.Add(role);

        if (roleName == "STUDENT")
        {
            user.student = new student
            {
                student_code = request.Code ?? "UNKNOWN",
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow
            };
        }
        else if (roleName == "LECTURER")
        {
            user.lecturer = new lecturer
            {
                lecturer_code = request.Code ?? "UNKNOWN",
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow
            };
        }

        _context.users.Add(user);
        await _context.SaveChangesAsync();

        return MapToResponse(user);
    }

    public async Task<StudentLinksResponse> GetStudentLinksAsync(long studentId)
    {
        var github = await _context.external_accounts.FirstOrDefaultAsync(e => e.user_id == studentId && e.provider == "GITHUB");
        var jira = await _context.external_accounts.FirstOrDefaultAsync(e => e.user_id == studentId && e.provider == "JIRA");

        return new StudentLinksResponse
        {
            GithubUrl = github?.username,
            JiraUrl = jira?.username
        };
    }

    public async Task<StudentLinksResponse> LinkStudentAccountsAsync(long studentId, LinkStudentAccountsRequest request)
    {
        var user = await _context.users.FindAsync(studentId)
            ?? throw new NotFoundException($"User {studentId} not found");

        if (!string.IsNullOrWhiteSpace(request.GithubUrl))
        {
            var gh = await _context.external_accounts.FirstOrDefaultAsync(e => e.user_id == studentId && e.provider == "GITHUB");
            if (gh == null)
            {
                gh = new external_account { user_id = studentId, provider = "GITHUB", created_at = DateTime.UtcNow, updated_at = DateTime.UtcNow };
                _context.external_accounts.Add(gh);
            }
            gh.username = request.GithubUrl;
            gh.external_user_key = request.GithubUrl;
            gh.updated_at = DateTime.UtcNow;
        }

        if (!string.IsNullOrWhiteSpace(request.JiraUrl))
        {
            var jira = await _context.external_accounts.FirstOrDefaultAsync(e => e.user_id == studentId && e.provider == "JIRA");
            if (jira == null)
            {
                jira = new external_account { user_id = studentId, provider = "JIRA", created_at = DateTime.UtcNow, updated_at = DateTime.UtcNow };
                _context.external_accounts.Add(jira);
            }
            jira.username = request.JiraUrl;
            jira.external_user_key = request.JiraUrl;
            jira.updated_at = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return await GetStudentLinksAsync(studentId);
    }
}
