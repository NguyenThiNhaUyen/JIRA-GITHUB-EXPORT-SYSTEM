using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using JiraGithubExport.JiraService.DTOs;
using JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.JiraService.Services.Implementations;

public class JiraClient : IJiraClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<JiraClient> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly string? _jiraEmail;
    private readonly string? _jiraApiToken;

    public JiraClient(HttpClient httpClient, IConfiguration configuration, ILogger<JiraClient> logger, IServiceScopeFactory scopeFactory)
    {
        _httpClient = httpClient;
        _logger = logger;
        _scopeFactory = scopeFactory;
        
        _jiraEmail = configuration["Jira:Email"];
        _jiraApiToken = configuration["Jira:ApiToken"];

        if (!string.IsNullOrEmpty(_jiraEmail) && !string.IsNullOrEmpty(_jiraApiToken))
        {
            var authString = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_jiraEmail}:{_jiraApiToken}"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authString);
        }
    }

    public async Task<bool> ValidateProjectAsync(string projectKey, string siteUrl)
    {
        try
        {
            var url = $"{siteUrl.TrimEnd('/')}/rest/api/3/project/{projectKey}";
            var response = await _httpClient.GetAsync(url);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate Jira project {ProjectKey}", projectKey);
            return false;
        }
    }

    public async Task SyncIssuesAsync(long jiraProjectId, string projectKey, string siteUrl)
    {
        try
        {
            _logger.LogInformation("Syncing issues for Jira project {ProjectKey}", projectKey);
            
            // Validate URL format
            if (string.IsNullOrWhiteSpace(siteUrl) || siteUrl.Contains("example.com"))
            {
                _logger.LogWarning("Invalid Jira URL configured: {SiteUrl}. Please update with your actual Jira instance URL.", siteUrl);
                return;
            }

            var url = $"{siteUrl.TrimEnd('/')}/rest/api/3/search?jql=project={projectKey}&maxResults=100";
            var response = await _httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to fetch Jira issues for {ProjectKey}: {StatusCode}", projectKey, response.StatusCode);
                return;
            }

            var searchResult = await response.Content.ReadFromJsonAsync<JiraSearchResponse>();
            if (searchResult == null || !searchResult.Issues.Any()) return;

            using var scope = _scopeFactory.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            foreach (var jiraIssue in searchResult.Issues)
            {
                var existing = await unitOfWork.JiraIssues.FirstOrDefaultAsync(i => i.jira_issue_key == jiraIssue.Key);
                
                if (existing != null)
                {
                    // Update existing issue
                    existing.title = jiraIssue.Fields.Summary;
                    existing.status = jiraIssue.Fields.Status.Name;
                    existing.priority = jiraIssue.Fields.Priority?.Name;
                    existing.updated_at = jiraIssue.Fields.Updated;
                    unitOfWork.JiraIssues.Update(existing);
                }
                else
                {
                    // Create new issue
                    var issue = new jira_issue
                    {
                        jira_project_id = jiraProjectId,
                        jira_issue_key = jiraIssue.Key,
                        title = jiraIssue.Fields.Summary,
                        issue_type = jiraIssue.Fields.Issuetype.Name,
                        status = jiraIssue.Fields.Status.Name,
                        priority = jiraIssue.Fields.Priority?.Name,
                        created_at = jiraIssue.Fields.Created,
                        updated_at = jiraIssue.Fields.Updated
                    };
                    unitOfWork.JiraIssues.Add(issue);
                }
            }

            await unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Successfully synced {Count} issues for Jira project {ProjectKey}", searchResult.Issues.Count, projectKey);
        }
        catch (System.Net.Sockets.SocketException ex)
        {
            _logger.LogError("DNS/Network error for Jira URL '{SiteUrl}': {Message}. Please verify the Jira URL is correct and accessible.", siteUrl, ex.Message);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError("HTTP request error for Jira project {ProjectKey}: {Message}. Please check your Jira URL and credentials.", projectKey, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync issues for {ProjectKey}", projectKey);
            throw;
        }
    }

    public async Task<int> GetIssueCountAsync(string projectKey, string siteUrl, string status)
    {
        try
        {
            var jql = $"project={projectKey} AND status='{status}'";
            var url = $"{siteUrl.TrimEnd('/')}/rest/api/3/search?jql={Uri.EscapeDataString(jql)}&maxResults=0";
            var response = await _httpClient.GetAsync(url);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<JiraSearchResponse>();
                return result?.Total ?? 0;
            }
            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get issue count for {ProjectKey}", projectKey);
            return 0;
        }
    }

    public async Task<DateTime?> GetLastUpdateDateAsync(string projectKey, string siteUrl)
    {
        try
        {
            var jql = $"project={projectKey} ORDER BY updated DESC";
            var url = $"{siteUrl.TrimEnd('/')}/rest/api/3/search?jql={Uri.EscapeDataString(jql)}&maxResults=1";
            var response = await _httpClient.GetAsync(url);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<JiraSearchResponse>();
                return result?.Issues?.FirstOrDefault()?.Fields.Updated;
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get last update date for {ProjectKey}", projectKey);
            return null;
        }
    }
}
