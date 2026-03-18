using System.Security.Claims;
using System.Collections.Generic;
using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.Shared.Infrastructure.Identity.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user, List<string> roles);
    ClaimsPrincipal? ValidateToken(string token);
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
