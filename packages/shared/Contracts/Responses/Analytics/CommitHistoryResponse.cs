namespace JiraGithubExport.Shared.Contracts.Responses.Analytics;

public class StudentCommitHistoryResponse
{
    public long StudentUserId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentCode { get; set; } = string.Empty;
    public int Commits { get; set; }
    public int PullRequests { get; set; }
}
