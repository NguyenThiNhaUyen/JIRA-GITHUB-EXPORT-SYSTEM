namespace JiraGithubExport.Shared.Contracts.Requests.Projects;

public class UpdateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
