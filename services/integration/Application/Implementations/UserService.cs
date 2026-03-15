<<<<<<< HEAD
=======
using System.Collections.Generic;
>>>>>>> origin
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Responses.Users;
using JiraGithubExport.Shared.Infrastructure.Identity.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;

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

<<<<<<< HEAD
=======
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

>>>>>>> origin
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
<<<<<<< HEAD
            .OrderBy(u => u.id)
=======
            .OrderByDescending(u => u.created_at)
>>>>>>> origin
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

<<<<<<< HEAD
        var mapped = items.Select(u => MapToResponse(u)).ToList();
=======
        var mapped = items.Select(MapToResponse).ToList();
>>>>>>> origin

        return new PagedResponse<UserDetailResponse>
        {
            Items = mapped,
<<<<<<< HEAD
            TotalItems = total,
=======
            TotalCount = total,
>>>>>>> origin
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
<<<<<<< HEAD
        Roles = u.roles.Select(r => r.role_name).ToList(),
        StudentCode = u.student?.student_code,
        LecturerCode = u.lecturer?.lecturer_code,
=======
        Role = u.roles.Any(r => r.role_name.ToUpper() == "ADMIN") ? "ADMIN" : (u.roles.Any(r => r.role_name.ToUpper() == "LECTURER") ? "LECTURER" : "STUDENT"),
        StudentCode = u.student?.student_code,
        StudentId = u.student?.student_code,
        LecturerCode = u.lecturer?.lecturer_code,
        Department = u.lecturer?.department ?? u.student?.department,
        AssignedCourses = u.lecturer?.courses.Select(c => c.course_code).ToList() ?? new List<string>(),
>>>>>>> origin
        CreatedAt = u.created_at
    };
}
