namespace JiraGithubExport.Shared.Contracts.Requests.Auth;

public class GoogleLoginRequest
{
    public string IdToken { get; set; } = string.Empty;
    public string Role { get; set; } = "STUDENT"; // Máº·c Ä‘á»‹nh náº¿u Client khĂ´ng truyá»n thĂ¬ váº«n lĂ  STUDENT
}

