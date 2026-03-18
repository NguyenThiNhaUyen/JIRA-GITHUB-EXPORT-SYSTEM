namespace JiraGithubExport.Shared.Contracts.Requests.Projects;

public class ReviewSrsRequest
{
    public string Status { get; set; } = null!;
    public string? Feedback { get; set; }
    public float? Score { get; set; }
    public string? Metadata { get; set; }
}
