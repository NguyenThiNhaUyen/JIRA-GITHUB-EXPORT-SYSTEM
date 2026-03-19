using System.ComponentModel.DataAnnotations;

namespace JiraGithubExportSystem.Shared.Contracts.Requests.Auth;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;
}







