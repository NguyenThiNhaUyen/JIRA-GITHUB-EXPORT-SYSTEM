namespace JiraGithubExport.Shared.Contracts.Requests.Auth;

public class GoogleLoginRequest
{
    public string IdToken { get; set; } = string.Empty;
    public string Role { get; set; } = "STUDENT"; // Mặc định nếu Client không truyền thì vẫn là STUDENT
}
