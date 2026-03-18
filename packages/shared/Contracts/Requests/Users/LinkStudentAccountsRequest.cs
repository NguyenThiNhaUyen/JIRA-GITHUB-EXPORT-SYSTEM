namespace JiraGithubExport.Shared.Contracts.Requests.Users;

public class LinkStudentAccountsRequest
{
    public long? CourseId { get; set; }
    public string? GithubUrl { get; set; }
    public string? JiraUrl { get; set; }
}
