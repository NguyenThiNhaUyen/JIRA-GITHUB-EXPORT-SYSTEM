using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Requests.Auth;
using JiraGithubExport.Shared.Contracts.Responses.Auth;
using JiraGithubExport.Shared.Infrastructure.Identity.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Google.Apis.Auth;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class AuthService : IAuthService
{
    private readonly JiraGithubToolDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<AuthService> _logger;
    private readonly IConfiguration _configuration;

    public AuthService(
        JiraGithubToolDbContext context,
        IJwtService jwtService,
        IPasswordHasher passwordHasher,
        ILogger<AuthService> logger,
        IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
        _logger = logger;
        _configuration = configuration;
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
                Role = GetPrimaryRole(roles),
                Roles = roles,
                StudentCode = user.student?.student_code,
                LecturerCode = user.lecturer?.lecturer_code
            }
        };
    }

    public async Task<LoginResponse> GoogleLoginAsync(GoogleLoginRequest request)
    {
        try
        {
            string clientId = _configuration["Authentication:Google:ClientId"] 
                ?? throw new BusinessException("Google Client ID is not configured");

            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId }
            };

            // Verify the ID Token with Google
            GoogleJsonWebSignature.Payload payload;
            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
            }
            catch (InvalidJwtException ex)
            {
                _logger.LogWarning(ex, "Invalid Google ID Token");
                throw new UnauthorizedException("Invalid Google ID Token");
            }

            // Check if user exists by email
            string email = payload.Email;
            var user = await _context.users
                .Include(u => u.roles)
                .Include(u => u.student)
                .Include(u => u.lecturer)
                .FirstOrDefaultAsync(u => u.email == email);

            if (user == null)
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try 
                {
                    // Create a new user if not exists
                    user = new user
                    {
                        email = email,
                        full_name = payload.Name,
                        enabled = true,
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow,
                        password = _passwordHasher.HashPassword(Guid.NewGuid().ToString()) // Random password for SSO users
                    };

                    _context.users.Add(user);
                    await _context.SaveChangesAsync();

                    // Role selection handling (Demo/Testing Only)
                    string requestedRole = string.IsNullOrWhiteSpace(request.Role) ? "STUDENT" : request.Role.ToUpper();
                    var validRoles = new[] { "ADMIN", "LECTURER", "STUDENT" };
                    
                    if (!validRoles.Contains(requestedRole))
                    {
                        requestedRole = "STUDENT";
                    }

                    var role = await _context.roles.FirstOrDefaultAsync(r => r.role_name == requestedRole);
                    if (role == null)
                    {
                        role = new role { role_name = requestedRole };
                        _context.roles.Add(role);
                        await _context.SaveChangesAsync();
                    }

                    user.roles.Add(role);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation("New user registered via Google SSO: {Email}", email);
                } 
                catch 
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            else if (!user.enabled)
            {
                _logger.LogWarning("Google Login failed: Account disabled - {Email}", email);
                throw new UnauthorizedException("Your account has been disabled");
            }

            // Get roles
            var roles = user.roles.Select(r => r.role_name).ToList();

            // Generate JWT Token exactly like standard login
            var token = _jwtService.GenerateToken(user, roles);
            
            _logger.LogInformation("User logged in successfully via Google SSO: {Email}", email);

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
                    Role = GetPrimaryRole(roles),
                    Roles = roles,
                    StudentCode = user.student?.student_code,
                    LecturerCode = user.lecturer?.lecturer_code
                }
            };
        }
        catch (Exception ex) when (ex is not UnauthorizedException && ex is not BusinessException)
        {
            _logger.LogError(ex, "Error processing Google Login");
            throw new BusinessException("An error occurred during Google authentication");
        }
    }

    public async Task<string> ForgotPasswordAsync(string email)
    {
        // Silently ignore unknown emails for security
        var user = await _context.users.FirstOrDefaultAsync(u => u.email == email.ToLower());
        if (user == null) return "If this email exists, a reset link has been sent.";

        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Replace("=", "").Replace("/", "").Replace("+", "");
        user.password_reset_token = token;
        user.password_reset_token_expires_at = DateTime.UtcNow.AddHours(1);
        user.updated_at = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // In production: send email. In dev mode: return token directly.
        _logger.LogInformation("Password reset token for {Email}: {Token}", email, token);
        return token;
    }

    public async Task ResetPasswordAsync(string token, string newPassword)
    {
        var user = await _context.users.FirstOrDefaultAsync(u =>
            u.password_reset_token == token &&
            u.password_reset_token_expires_at > DateTime.UtcNow)
            ?? throw new BusinessException("Invalid or expired reset token.");

        user.password = _passwordHasher.HashPassword(newPassword);
        user.password_reset_token = null;
        user.password_reset_token_expires_at = null;
        user.updated_at = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private static string GetPrimaryRole(List<string> roles)
    {
        var upperRoles = roles.Select(r => r.ToUpper()).ToList();
        if (upperRoles.Contains("ADMIN") || upperRoles.Contains("SUPER_ADMIN")) return "ADMIN";
        if (upperRoles.Contains("LECTURER")) return "LECTURER";
        return roles.FirstOrDefault()?.ToUpper() ?? "STUDENT";
    }
}
