namespace JiraGithubExport.Shared.Contracts.Requests.Auth;

public class GoogleLoginRequest
{
    public string IdToken { get; set; } = string.Empty;
}
