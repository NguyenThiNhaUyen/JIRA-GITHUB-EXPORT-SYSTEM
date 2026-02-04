namespace JiraGithubExport.Shared.Contracts.Responses.Auth;

public class LoginResponse
{
    public string AccessToken { get; set; } = null!;
    public string TokenType { get; set; } = "Bearer";
    public int ExpiresIn { get; set; } // seconds
    public UserInfo User { get; set; } = null!;
}

public class UserInfo
{
    public long Id { get; set; }
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public List<string> Roles { get; set; } = new();
    public string? StudentCode { get; set; }
    public string? LecturerCode { get; set; }
}







