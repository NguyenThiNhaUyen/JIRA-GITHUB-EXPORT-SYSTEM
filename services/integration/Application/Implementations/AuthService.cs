using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Requests.Auth;
using JiraGithubExport.Shared.Contracts.Responses.Auth;
using JiraGithubExport.Shared.Infrastructure.Identity.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class AuthService : IAuthService
{
    private readonly JiraGithubToolDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        JiraGithubToolDbContext context,
        IJwtService jwtService,
        IPasswordHasher passwordHasher,
        ILogger<AuthService> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        // Find user by email
        var user = await _context.users
            .Include(u => u.roles)
            .Include(u => u.student)
            .Include(u => u.lecturer)
            .FirstOrDefaultAsync(u => u.email == request.Email);

        if (user == null)
        {
            _logger.LogWarning("Login failed: User not found - {Email}", request.Email);
            throw new UnauthorizedException("Invalid email or password");
        }

        // Verify password
        if (!_passwordHasher.VerifyPassword(request.Password, user.password))
        {
            _logger.LogWarning("Login failed: Invalid password - {Email}", request.Email);
            throw new UnauthorizedException("Invalid email or password");
        }

        // Check if user is enabled
        if (!user.enabled)
        {
            _logger.LogWarning("Login failed: Account disabled - {Email}", request.Email);
            throw new UnauthorizedException("Account is disabled");
        }

        // Get roles
        var roles = user.roles.Select(r => r.role_name).ToList();

        // Generate JWT token
        var token = _jwtService.GenerateToken(user, roles);

        return new LoginResponse
        {
            AccessToken = token,
            TokenType = "Bearer",
            ExpiresIn = 3600, // 1 hour
            User = new UserInfo
            {
                Id = user.id,
                Email = user.email,
                FullName = user.full_name ?? user.email,
                Roles = roles,
                StudentCode = user.student?.student_code,
                LecturerCode = user.lecturer?.lecturer_code
            }
        };
    }

    public async Task<UserInfo> RegisterAsync(RegisterRequest request)
    {
        // Validate role
        var validRoles = new[] { "ADMIN", "LECTURER", "STUDENT" };
        if (!validRoles.Contains(request.Role.ToUpper()))
        {
            _logger.LogWarning("Registration failed: Invalid role - {Role}", request.Role);
            throw new ValidationException("Invalid role. Must be ADMIN, LECTURER, or STUDENT");
        }

        // Check if email already exists
        var existingUser = await _context.users.FirstOrDefaultAsync(u => u.email == request.Email);
        if (existingUser != null)
        {
            _logger.LogWarning("Registration failed: Email exists - {Email}", request.Email);
            throw new BusinessException("Email already registered");
        }

        // Validate role-specific fields
        if (request.Role.ToUpper() == "STUDENT" && string.IsNullOrEmpty(request.StudentCode))
        {
            _logger.LogWarning("Registration failed: Student code required");
            throw new ValidationException("Student code is required for STUDENT role");
        }

        if (request.Role.ToUpper() == "LECTURER" && string.IsNullOrEmpty(request.LecturerCode))
        {
            _logger.LogWarning("Registration failed: Lecturer code required");
            throw new ValidationException("Lecturer code is required for LECTURER role");
        }

        // Check if student code already exists
        if (!string.IsNullOrEmpty(request.StudentCode))
        {
            var existingStudent = await _context.students
                .FirstOrDefaultAsync(s => s.student_code == request.StudentCode);
            if (existingStudent != null)
            {
                _logger.LogWarning("Registration failed: Student code exists");
                throw new BusinessException("Student code already exists");
            }
        }

        // Check if lecturer code already exists
        if (!string.IsNullOrEmpty(request.LecturerCode))
        {
            var existingLecturer = await _context.lecturers
                .FirstOrDefaultAsync(l => l.lecturer_code == request.LecturerCode);
            if (existingLecturer != null)
            {
                _logger.LogWarning("Registration failed: Lecturer code exists");
                throw new BusinessException("Lecturer code already exists");
            }
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Create user
            var user = new user
            {
                email = request.Email,
                password = _passwordHasher.HashPassword(request.Password),
                full_name = request.FullName,
                enabled = true,
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow
            };

            _context.users.Add(user);
            await _context.SaveChangesAsync();

            // Assign role
            var role = await _context.roles.FirstOrDefaultAsync(r => r.role_name == request.Role.ToUpper());
            if (role == null)
            {
                role = new role { role_name = request.Role.ToUpper() };
                _context.roles.Add(role);
                await _context.SaveChangesAsync();
            }

            user.roles.Add(role);
            await _context.SaveChangesAsync();

            // Create student or lecturer profile
            if (request.Role.ToUpper() == "STUDENT")
            {
                var student = new student
                {
                    user_id = user.id,
                    student_code = request.StudentCode!,
                    major = request.Major,
                    intake_year = request.IntakeYear,
                    department = request.StudentDepartment,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                _context.students.Add(student);
                await _context.SaveChangesAsync();
            }
            else if (request.Role.ToUpper() == "LECTURER")
            {
                var lecturer = new lecturer
                {
                    user_id = user.id,
                    lecturer_code = request.LecturerCode!,
                    office_email = request.OfficeEmail,
                    department = request.LecturerDepartment,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                _context.lecturers.Add(lecturer);
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            return new UserInfo
            {
                Id = user.id,
                Email = user.email,
                FullName = user.full_name ?? user.email,
                Roles = new List<string> { request.Role.ToUpper() },
                StudentCode = request.StudentCode,
                LecturerCode = request.LecturerCode
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "❌ Registration failed for {Email}: {Error}", request.Email, ex.Message);
            throw;
        }
    }
}








