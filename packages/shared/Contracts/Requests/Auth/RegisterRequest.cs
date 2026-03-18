using System.ComponentModel.DataAnnotations;

namespace JiraGithubExport.Shared.Contracts.Requests.Auth;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = null!;

    [Required]
    public string FullName { get; set; } = null!;

    [Required]
    public string Role { get; set; } = null!; // "ADMIN", "LECTURER", "STUDENT"

    // Student-specific
    public string? StudentCode { get; set; }
    public string? Major { get; set; }
    public int? IntakeYear { get; set; }
    public string? StudentDepartment { get; set; }

    // Lecturer-specific
    public string? LecturerCode { get; set; }
    public string? OfficeEmail { get; set; }
    public string? LecturerDepartment { get; set; }
}







