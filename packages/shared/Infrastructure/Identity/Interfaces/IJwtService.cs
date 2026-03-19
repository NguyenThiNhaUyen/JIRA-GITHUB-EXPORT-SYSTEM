using System.Security.Claims;
using JiraGithubExportSystem.Shared.Models;

namespace JiraGithubExportSystem.Shared.Infrastructure.Identity.Interfaces;

public interface IJwtService
{
    string GenerateToken(user user, List<string> roles);
    ClaimsPrincipal? ValidateToken(string token);
}







