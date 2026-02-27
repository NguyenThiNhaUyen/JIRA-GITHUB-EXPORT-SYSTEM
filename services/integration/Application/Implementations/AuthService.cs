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

                    // Assign default STUDENT role
                    var role = await _context.roles.FirstOrDefaultAsync(r => r.role_name == "STUDENT");
                    if (role == null)
                    {
                        role = new role { role_name = "STUDENT" };
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
}








