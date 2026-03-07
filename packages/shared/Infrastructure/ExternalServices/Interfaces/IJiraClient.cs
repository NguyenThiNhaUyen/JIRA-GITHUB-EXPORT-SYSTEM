namespace JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;

public interface IJiraClient
{
    Task<bool> ValidateProjectAsync(string projectKey, string siteUrl);
    Task SyncIssuesAsync(long jiraProjectId, string projectKey, string siteUrl);
    Task<int> GetIssueCountAsync(string projectKey, string siteUrl, string status);
    Task<DateTime?> GetLastUpdateDateAsync(string projectKey, string siteUrl);
}









