namespace JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;

public interface IGitHubClient
{
    Task<bool> ValidateRepositoryAsync(string owner, string repo);
    Task SyncCommitsAsync(long repositoryId, string owner, string repo);
    Task SyncPullRequestsAsync(long repositoryId, string owner, string repo);
    Task<int> GetCommitCountAsync(string owner, string repo, DateTime since);
    Task<DateTime?> GetLastCommitDateAsync(string owner, string repo);
}
