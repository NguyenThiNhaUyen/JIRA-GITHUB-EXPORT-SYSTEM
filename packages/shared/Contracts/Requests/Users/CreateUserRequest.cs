namespace JiraGithubExport.Shared.Contracts.Requests.Users;

public class CreateUserRequest
{
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Role { get; set; } = null!; // LECTURER, STUDENT, ADMIN
    public string? Code { get; set; }
}

