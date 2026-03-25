namespace JiraGithubExport.Shared.Contracts.Requests.Auth;

public class RefreshRequest
{
    // Keep both names so older/newer clients can work.
    // Backend logic will prefer `Token` then fallback to `RefreshToken`.
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
}
