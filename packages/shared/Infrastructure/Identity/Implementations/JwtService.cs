using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JiraGithubExport.Shared.Common;
using JiraGithubExport.Shared.Infrastructure.Identity.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace JiraGithubExport.Shared.Infrastructure.Identity.Implementations;

public class JwtService : IJwtService
{
    private readonly JwtSettings _jwtSettings;

    public JwtService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
    }

    public string GenerateToken(User User, List<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, User.Id.ToString()),
            new Claim(ClaimTypes.Email, User.Email),
            new Claim(ClaimTypes.Name, User.FullName ?? User.Email),
            new Claim("user_id", User.Id.ToString()),
            new Claim("email", User.Email)
        };

        // Add primary Role as claim (Æ°u tiĂªn cao nháº¥t: ADMIN > Lecturer > Student)
        // Chá»‰ dĂ¹ng 1 Role duy nháº¥t Ä‘á»ƒ [Authorize(Roles = "...")] hoáº¡t Ä‘á»™ng chĂ­nh xĂ¡c
        var upperRoles = roles.Select(r => r.ToUpper()).ToList();
        string primaryRole;
        if (upperRoles.Contains("ADMIN") || upperRoles.Contains("SUPER_ADMIN"))
            primaryRole = "ADMIN";
        else if (upperRoles.Contains("Lecturer"))
            primaryRole = "Lecturer";
        else
            primaryRole = upperRoles.FirstOrDefault() ?? "Student";

        claims.Add(new Claim(ClaimTypes.Role, primaryRole));
        // CÅ©ng thĂªm claim "Role" Ä‘á»ƒ FE decode JWT láº¥y Ä‘Æ°á»£c
        claims.Add(new Claim("Role", primaryRole));

        // Optional: Keep all roles if multiple Role support is needed in the future
        foreach (var Role in roles)
        {
            if (Role.ToUpper() != primaryRole) 
                claims.Add(new Claim(ClaimTypes.Role, Role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            return tokenHandler.ValidateToken(token, validationParameters, out _);
        }
        catch
        {
            return null;
        }
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = false, // Ignore expiration for refresh
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out var securityToken);
            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }
            return principal;
        }
        catch
        {
            return null;
        }
    }
}
