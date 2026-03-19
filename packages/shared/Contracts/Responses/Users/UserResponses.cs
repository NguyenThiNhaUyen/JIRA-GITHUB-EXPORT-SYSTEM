namespace JiraGithubExportSystem.Shared.Contracts.Responses.Users;

public class UserDetailResponse
{
    public long Id { get; set; }
    public string Email { get; set; } = null!;
    public string? FullName { get; set; }
    public bool Enabled { get; set; }
    public List<string> Roles { get; set; } = new();
    public string? StudentCode { get; set; }
    public string? LecturerCode { get; set; }
    public DateTime CreatedAt { get; set; }
}
