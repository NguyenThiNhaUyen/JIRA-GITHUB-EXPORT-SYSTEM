using System.ComponentModel.DataAnnotations;

namespace JiraGithubExport.Shared.Contracts.Requests.Users;

public class UpdateUserRoleRequest
{
    [Required]
    public string Role { get; set; } = null!; // ADMIN | LECTURER | STUDENT
}

public class UpdateUserStatusRequest
{
    [Required]
    public bool Enabled { get; set; }
}

public class AdminResetPasswordRequest
{
    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = null!;
}
