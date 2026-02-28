using System.Security.Claims;
using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.Shared.Infrastructure.Identity.Interfaces;

public interface IJwtService
{
    string GenerateToken(user user, List<string> roles);
    ClaimsPrincipal? ValidateToken(string token);
}







