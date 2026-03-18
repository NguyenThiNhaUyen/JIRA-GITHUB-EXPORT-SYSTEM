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
        var Users = await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Student)
            .Where(u => u.Roles.Any(r => r.RoleName == "Student"))
            .ToListAsync();
        return Users.Select(MapToResponse).ToList();
    }

    public async Task<List<UserDetailResponse>> GetLecturersAsync()
    {
        var Users = await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Lecturer)
            .Where(u => u.Roles.Any(r => r.RoleName == "Lecturer"))
            .ToListAsync();
        return Users.Select(MapToResponse).ToList();
    }

    public async Task<PagedResponse<UserDetailResponse>> GetAllUsersAsync(string? Role, PagedRequest request)
    {
        var query = _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Student)
            .Include(u => u.Lecturer)
            .AsQueryable();

        if (!string.IsNullOrEmpty(Role))
        {
            query = query.Where(u => u.Roles.Any(r => r.RoleName == Role.ToUpper()));
        }

        var total = await query.CountAsync();
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 20;
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
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
        var User = await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Student)
            .Include(u => u.Lecturer)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new NotFoundException($"User {userId} not found");

        return MapToResponse(User);
    }

    public async Task UpdateUserRoleAsync(long userId, string Role)
    {
        var User = await _context.Users
            .Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new NotFoundException($"User {userId} not found");

        // Remove existing Roles and set new Role
        User.Roles.Clear();
        var roleEntity = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == Role.ToUpper())
            ?? throw new NotFoundException($"Role '{Role}' not found");
        User.Roles.Add(roleEntity);

        await _context.SaveChangesAsync();
    }

    public async Task UpdateUserStatusAsync(long userId, bool Enabled)
    {
        var User = await _context.Users.FindAsync(userId)
            ?? throw new NotFoundException($"User {userId} not found");

        User.Enabled = Enabled;
        User.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task AdminResetPasswordAsync(long userId, string newPassword)
    {
        var User = await _context.Users.FindAsync(userId)
            ?? throw new NotFoundException($"User {userId} not found");

        User.Password = _passwordHasher.HashPassword(newPassword);
        User.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private static UserDetailResponse MapToResponse(User u) => new()
    {
        Id = u.Id,
        Email = u.Email,
        FullName = u.FullName,
        Enabled = u.Enabled,
        Roles = u.Roles.Select(r => r.RoleName).ToList(),
        Role = u.Roles.Any(r => r.RoleName.ToUpper() == "ADMIN") ? "ADMIN" : (u.Roles.Any(r => r.RoleName.ToUpper() == "Lecturer") ? "Lecturer" : "Student"),
        StudentCode = u.Student?.StudentCode,
        StudentId = u.Student?.StudentCode,
        LecturerCode = u.Lecturer?.LecturerCode,
        Department = u.Lecturer?.Department ?? u.Student?.Department,
        AssignedCourses = u.Lecturer?.Courses?.Select(c => c.CourseCode).ToList() ?? new List<string>(),
        CreatedAt = u.CreatedAt
    };

    public async Task<UserDetailResponse> CreateUserAsync(CreateUserRequest request)
    {
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            throw new BusinessException($"User with Email {request.Email} already exists.");
        }

        var roleName = request.Role?.ToUpper() ?? "Student";
        var Role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
        if (Role == null)
        {
            Role = new Role { RoleName = roleName };
            _context.Roles.Add(Role);
        }

        var User = new User
        {
            Email = request.Email,
            FullName = request.FullName,
            Password = _passwordHasher.HashPassword("Admin@123"),
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        User.Roles.Add(Role);

        if (roleName == "Student")
        {
            User.Student = new Student
            {
                StudentCode = request.Code ?? "UNKNOWN",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }
        else if (roleName == "Lecturer")
        {
            User.Lecturer = new Lecturer
            {
                LecturerCode = request.Code ?? "UNKNOWN",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        _context.Users.Add(User);
        await _context.SaveChangesAsync();

        return MapToResponse(User);
    }

    public async Task<StudentLinksResponse> GetStudentLinksAsync(long studentId)
    {
        var github = await _context.ExternalAccounts.FirstOrDefaultAsync(e => e.UserId == studentId && e.Provider == "GITHUB");
        var jira = await _context.ExternalAccounts.FirstOrDefaultAsync(e => e.UserId == studentId && e.Provider == "JIRA");

        return new StudentLinksResponse
        {
            GithubUrl = github?.Username,
            JiraUrl = jira?.Username
        };
    }

    public async Task<StudentLinksResponse> LinkStudentAccountsAsync(long studentId, LinkStudentAccountsRequest request)
    {
        var User = await _context.Users.FindAsync(studentId)
            ?? throw new NotFoundException($"User {studentId} not found");

        if (!string.IsNullOrWhiteSpace(request.GithubUrl))
        {
            var gh = await _context.ExternalAccounts.FirstOrDefaultAsync(e => e.UserId == studentId && e.Provider == "GITHUB");
            if (gh == null)
            {
                gh = new ExternalAccount { UserId = studentId, Provider = "GITHUB", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                _context.ExternalAccounts.Add(gh);
            }
            gh.Username = request.GithubUrl;
            gh.ExternalUserKey = request.GithubUrl;
            gh.UpdatedAt = DateTime.UtcNow;
        }

        if (!string.IsNullOrWhiteSpace(request.JiraUrl))
        {
            var jira = await _context.ExternalAccounts.FirstOrDefaultAsync(e => e.UserId == studentId && e.Provider == "JIRA");
            if (jira == null)
            {
                jira = new ExternalAccount { UserId = studentId, Provider = "JIRA", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                _context.ExternalAccounts.Add(jira);
            }
            jira.Username = request.JiraUrl;
            jira.ExternalUserKey = request.JiraUrl;
            jira.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return await GetStudentLinksAsync(studentId);
    }
}
