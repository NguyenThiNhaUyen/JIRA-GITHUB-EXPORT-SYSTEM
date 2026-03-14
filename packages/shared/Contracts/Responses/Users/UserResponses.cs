namespace JiraGithubExport.Shared.Contracts.Responses.Users;

public class UserDetailResponse
{
    public long Id { get; set; }
    public string Email { get; set; } = null!;
    public string? FullName { get; set; }
    public bool Enabled { get; set; }
    public string? Role { get; set; }
    public string? StudentCode { get; set; }
    public string? StudentId { get; set; }
    public string? LecturerCode { get; set; }
    public string? Department { get; set; }
    public List<string> AssignedCourses { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
