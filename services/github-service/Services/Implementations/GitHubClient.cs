using System.Net.Http.Json;
using System.Text.RegularExpressions;
using JiraGithubExport.GithubService.DTOs;
using JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.GithubService.Services.Implementations;

public class GitHubClient : IGitHubClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GitHubClient> _logger;
    private readonly string? _githubToken;
    private readonly IServiceScopeFactory _scopeFactory;

    public GitHubClient(HttpClient httpClient, IConfiguration configuration, ILogger<GitHubClient> logger, IServiceScopeFactory scopeFactory)
    {
        _httpClient = httpClient;
        _logger = logger;
        _scopeFactory = scopeFactory;
        _githubToken = configuration["GitHub:Token"];
        
        if (!string.IsNullOrEmpty(_githubToken))
        {
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _githubToken);
        }
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "PBL-Platform");
    }

    public async Task<bool> ValidateRepositoryAsync(string owner, string repo)
    {
        try
        {
            var response = await _httpClient.GetAsync($"repos/{owner}/{repo}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate GitHub repository {Owner}/{Repo}", owner, repo);
            return false;
        }
    }

    public async Task SyncCommitsAsync(long repositoryId, string owner, string repo)
    {
        try
        {
            _logger.LogInformation("Syncing commits for {Owner}/{Repo}", owner, repo);
            
            var response = await _httpClient.GetAsync($"repos/{owner}/{repo}/commits?per_page=100");
            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    _logger.LogWarning("Repository {Owner}/{Repo} not found (404). Please verify the repository exists and you have access to it.", owner, repo);
                }
                else
                {
                    _logger.LogWarning("Failed to fetch commits for {Owner}/{Repo}: {StatusCode}", owner, repo, response.StatusCode);
                }
                return;
            }

            var commits = await response.Content.ReadFromJsonAsync<List<GitHubCommitResponse>>();
            if (commits == null || !commits.Any()) return;

            using var scope = _scopeFactory.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            foreach (var gitHubCommit in commits)
            {
                // Check if commit already exists
                var existing = await unitOfWork.GitHubCommits.FirstOrDefaultAsync(c => c.commit_sha == gitHubCommit.Sha);
                if (existing != null) continue;

                // Sync user if present
                long? authorId = null;
                if (gitHubCommit.Author != null)
                {
                    authorId = await EnsureGitHubUserAsync(unitOfWork, gitHubCommit.Author);
                }

                long? committerId = null;
                if (gitHubCommit.Committer != null)
                {
                    committerId = await EnsureGitHubUserAsync(unitOfWork, gitHubCommit.Committer);
                }

                var commit = new github_commit
                {
                    repo_id = repositoryId,
                    commit_sha = gitHubCommit.Sha,
                    message = gitHubCommit.Commit.Message,
                    author_github_user_id = authorId,
                    committer_github_user_id = committerId,
                    committed_at = gitHubCommit.Commit.Committer.Date,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };

                unitOfWork.GitHubCommits.Add(commit);
            }

            await unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Successfully synced {Count} new commits for {Owner}/{Repo}", commits.Count, owner, repo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync commits for {Owner}/{Repo}", owner, repo);
            throw;
        }
    }

    public async Task SyncPullRequestsAsync(long repositoryId, string owner, string repo)
    {
        try
        {
            _logger.LogInformation("Syncing pull requests for {Owner}/{Repo}", owner, repo);
            
            var response = await _httpClient.GetAsync($"repos/{owner}/{repo}/pulls?state=all&per_page=100");
            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    _logger.LogWarning("Repository {Owner}/{Repo} not found (404). Please verify the repository exists and you have access to it.", owner, repo);
                }
                else
                {
                    _logger.LogWarning("Failed to fetch PRs for {Owner}/{Repo}: {StatusCode}", owner, repo, response.StatusCode);
                }
                return;
            }

            var prs = await response.Content.ReadFromJsonAsync<List<GitHubPullRequestResponse>>();
            if (prs == null || !prs.Any()) return;

            using var scope = _scopeFactory.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            foreach (var gitHubPr in prs)
            {
                var existing = await unitOfWork.GitHubPullRequests.FirstOrDefaultAsync(p => p.repo_id == repositoryId && p.pr_number == gitHubPr.Number);
                
                long? authorId = null;
                if (gitHubPr.User != null)
                {
                    authorId = await EnsureGitHubUserAsync(unitOfWork, gitHubPr.User);
                }

                if (existing != null)
                {
                    // Update existing PR
                    existing.title = gitHubPr.Title;
                    existing.state = gitHubPr.State;
                    existing.updated_at = gitHubPr.UpdatedAt;
                    existing.closed_at = gitHubPr.ClosedAt;
                    existing.merged_at = gitHubPr.MergedAt;
                    unitOfWork.GitHubPullRequests.Update(existing);
                }
                else
                {
                    // Create new PR
                    var pr = new github_pull_request
                    {
                        repo_id = repositoryId,
                        pr_number = (int)gitHubPr.Number,
                        title = gitHubPr.Title,
                        state = gitHubPr.State,
                        author_github_user_id = authorId,
                        created_at = gitHubPr.CreatedAt,
                        updated_at = gitHubPr.UpdatedAt,
                        closed_at = gitHubPr.ClosedAt,
                        merged_at = gitHubPr.MergedAt
                    };
                    unitOfWork.GitHubPullRequests.Add(pr);
                }
            }

            await unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Successfully synced {Count} PRs for {Owner}/{Repo}", prs.Count, owner, repo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync PRs for {Owner}/{Repo}", owner, repo);
            throw;
        }
    }

    public async Task<int> GetCommitCountAsync(string owner, string repo, DateTime since)
    {
        try
        {
            var sinceParam = since.ToString("yyyy-MM-ddTHH:mm:ssZ");
            var response = await _httpClient.GetAsync($"repos/{owner}/{repo}/commits?since={sinceParam}&per_page=1");
            
            if (response.IsSuccessStatusCode)
            {
                if (response.Headers.TryGetValues("Link", out var linkHeaders))
                {
                    var linkHeader = linkHeaders.First();
                    // Example: <https://api.github.com/repositories/123/commits?since=...&per_page=1&page=2>; rel="next", <https://api.github.com/repositories/123/commits?since=...&per_page=1&page=45>; rel="last"
                    var match = Regex.Match(linkHeader, @"page=(\d+)>; rel=""last""");
                    if (match.Success && int.TryParse(match.Groups[1].Value, out int lastPage))
                    {
                        return lastPage;
                    }
                }
                
                // If no Link header, check if there are any commits at all
                var commits = await response.Content.ReadFromJsonAsync<List<GitHubCommitResponse>>();
                return commits?.Any() == true ? 1 : 0;
            }
            
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get commit count for {Owner}/{Repo}", owner, repo);
            return 0;
        }
    }

    public async Task<DateTime?> GetLastCommitDateAsync(string owner, string repo)
    {
        try
        {
            var response = await _httpClient.GetAsync($"repos/{owner}/{repo}/commits?per_page=1");
            if (response.IsSuccessStatusCode)
            {
                var commits = await response.Content.ReadFromJsonAsync<List<GitHubCommitResponse>>();
                return commits?.FirstOrDefault()?.Commit?.Committer?.Date;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get last commit date for {Owner}/{Repo}", owner, repo);
            return null;
        }
    }

    private async Task<long> EnsureGitHubUserAsync(IUnitOfWork unitOfWork, GitHubUser gitHubUser)
    {
        var dbUser = await unitOfWork.GitHubUsers.FirstOrDefaultAsync(u => u.github_user_id == gitHubUser.Id);
        if (dbUser != null) return dbUser.id;

        dbUser = new github_user
        {
            github_user_id = gitHubUser.Id,
            login = gitHubUser.Login,
            user_type = gitHubUser.Type,
            created_at = DateTime.UtcNow,
            updated_at = DateTime.UtcNow
        };

        unitOfWork.GitHubUsers.Add(dbUser);
        await unitOfWork.SaveChangesAsync();
        return dbUser.id;
    }
}


