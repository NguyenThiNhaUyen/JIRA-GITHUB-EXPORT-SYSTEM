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
using System.Security.Claims;

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
        // Find User by Email
        var User = await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Student)
            .Include(u => u.Lecturer)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (User == null)
        {
            _logger.LogWarning("Login failed: User not found - {Email}", request.Email);
            throw new UnauthorizedException("Invalid Email or Password");
        }

        // Verify Password
        if (!_passwordHasher.VerifyPassword(request.Password, User.Password))
        {
            _logger.LogWarning("Login failed: Invalid Password - {Email}", request.Email);
            throw new UnauthorizedException("Invalid Email or Password");
        }

        // Check if User is Enabled
        if (!User.Enabled)
        {
            _logger.LogWarning("Login failed: Account disabled - {Email}", request.Email);
            throw new UnauthorizedException("Account is disabled");
        }

        // Get Roles
        var Roles = User.Roles.Select(r => r.RoleName).ToList();

        // Generate JWT token
        var token = _jwtService.GenerateToken(User, Roles);

        return new LoginResponse
        {
            AccessToken = token,
            TokenType = "Bearer",
            ExpiresIn = 3600, // 1 hour
            User = new UserInfo
            {
                Id = User.Id,
                Email = User.Email,
                FullName = User.FullName ?? User.Email,
                Role = GetPrimaryRole(Roles),
                Roles = Roles,
                StudentCode = User.Student?.StudentCode,
                LecturerCode = User.Lecturer?.LecturerCode
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

            // Check if User exists by Email
            string Email = payload.Email;
            var User = await _context.Users
                .Include(u => u.Roles)
                .Include(u => u.Student)
                .Include(u => u.Lecturer)
                .FirstOrDefaultAsync(u => u.Email == Email);

            if (User == null)
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try 
                {
                    // Create a new User if not exists
                    User = new User
                    {
                        Email = Email,
                        FullName = payload.Name,
                        Enabled = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Password = _passwordHasher.HashPassword(Guid.NewGuid().ToString()) // Random Password for SSO Users
                    };

                    _context.Users.Add(User);
                    await _context.SaveChangesAsync();

                    // Role selection handling (Demo/Testing Only)
                    string requestedRole = string.IsNullOrWhiteSpace(request.Role) ? "Student" : request.Role.ToUpper();
                    var validRoles = new[] { "ADMIN", "Lecturer", "Student" };
                    
                    if (!validRoles.Contains(requestedRole))
                    {
                        requestedRole = "Student";
                    }

                    var Role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == requestedRole);
                    if (Role == null)
                    {
                        Role = new Role { RoleName = requestedRole };
                        _context.Roles.Add(Role);
                        await _context.SaveChangesAsync();
                    }

                    User.Roles.Add(Role);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation("New User registered via Google SSO: {Email}", Email);
                } 
                catch 
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            else if (!User.Enabled)
            {
                _logger.LogWarning("Google Login failed: Account disabled - {Email}", Email);
                throw new UnauthorizedException("Your account has been disabled");
            }

            // Get Roles
            var Roles = User.Roles.Select(r => r.RoleName).ToList();

            // Generate JWT Token exactly like standard login
            var token = _jwtService.GenerateToken(User, Roles);
            
            _logger.LogInformation("User logged in successfully via Google SSO: {Email}", Email);

            return new LoginResponse
            {
                AccessToken = token,
                TokenType = "Bearer",
                ExpiresIn = 3600, // 1 hour
                User = new UserInfo
                {
                    Id = User.Id,
                    Email = User.Email,
                    FullName = User.FullName ?? User.Email,
                    Role = GetPrimaryRole(Roles),
                    Roles = Roles,
                    StudentCode = User.Student?.StudentCode,
                    LecturerCode = User.Lecturer?.LecturerCode
                }
            };
        }
        catch (Exception ex) when (ex is not UnauthorizedException && ex is not BusinessException)
        {
            _logger.LogError(ex, "Error processing Google Login");
            throw new BusinessException("An error occurred during Google authentication");
        }
    }

    public async Task<string> ForgotPasswordAsync(string Email)
    {
        // Silently ignore unknown emails for security
        var User = await _context.Users.FirstOrDefaultAsync(u => u.Email == Email.ToLower());
        if (User == null) return "If this Email exists, a reset link has been sent.";

        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Replace("=", "").Replace("/", "").Replace("+", "");
        User.PasswordResetToken = token;
        User.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddHours(1);
        User.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // In production: send Email. In dev mode: return token directly.
        _logger.LogInformation("Password reset token for {Email}: {Token}", Email, token);
        return token;
    }

    public async Task ResetPasswordAsync(string token, string newPassword)
    {
        var User = await _context.Users.FirstOrDefaultAsync(u =>
            u.PasswordResetToken == token &&
            u.PasswordResetTokenExpiresAt > DateTime.UtcNow)
            ?? throw new BusinessException("Invalid or expired reset token.");

        User.Password = _passwordHasher.HashPassword(newPassword);
        User.PasswordResetToken = null;
        User.PasswordResetTokenExpiresAt = null;
        User.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private static string GetPrimaryRole(List<string> Roles)
    {
        var upperRoles = Roles.Select(r => r.ToUpper()).ToList();
        if (upperRoles.Contains("ADMIN") || upperRoles.Contains("SUPER_ADMIN")) return "ADMIN";
        if (upperRoles.Contains("Lecturer")) return "Lecturer";
        return Roles.FirstOrDefault()?.ToUpper() ?? "Student";
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshRequest request)
    {
        var principal = _jwtService.GetPrincipalFromExpiredToken(request.Token);
        if (principal == null)
        {
            throw new UnauthorizedException("Invalid token");
        }

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!long.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedException("Invalid token claims");
        }

        var User = await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Student)
            .Include(u => u.Lecturer)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (User == null || !User.Enabled)
        {
            throw new UnauthorizedException("User not found or disabled");
        }

        var Roles = User.Roles.Select(r => r.RoleName).ToList();
        var token = _jwtService.GenerateToken(User, Roles);

        return new LoginResponse
        {
            AccessToken = token,
            TokenType = "Bearer",
            ExpiresIn = 3600, // 1 hour
            User = new UserInfo
            {
                Id = User.Id,
                Email = User.Email,
                FullName = User.FullName ?? User.Email,
                Role = GetPrimaryRole(Roles),
                Roles = Roles,
                StudentCode = User.Student?.StudentCode,
                LecturerCode = User.Lecturer?.LecturerCode
            }
        };
    }
}
