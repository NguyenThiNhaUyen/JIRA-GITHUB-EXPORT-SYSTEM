using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using JiraGithubExport.JiraService.DTOs;
using JiraGithubExport.Shared.Contracts.Responses.Integrations;
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

    public async Task SyncIssuesAsync(long jiraProjectId, string projectKey, string siteUrl, string? jiraToken = null)
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
            var response = await SendGetAsync(url, jiraToken);
            
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
                    existing.title = jiraIssue.Fields.Summary;
                    existing.status = jiraIssue.Fields.Status.Name;
                    existing.priority = jiraIssue.Fields.Priority?.Name;
                    existing.updated_at = jiraIssue.Fields.Updated;
                    existing.due_date = jiraIssue.Fields.Duedate;
                    existing.resolution_date = jiraIssue.Fields.Resolutiondate;
                    existing.story_points = ExtractStoryPoints(jiraIssue.Fields.ExtensionData);

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
                        updated_at = jiraIssue.Fields.Updated,
                        due_date = jiraIssue.Fields.Duedate,
                        resolution_date = jiraIssue.Fields.Resolutiondate,
                        story_points = ExtractStoryPoints(jiraIssue.Fields.ExtensionData)
                    };
                    unitOfWork.JiraIssues.Add(issue);
                }
            }

            await unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Successfully synced {Count} issues for Jira project {ProjectKey}", searchResult.Issues.Count, projectKey);
        }
        catch (System.Net.Sockets.SocketException ex)
        {
            _logger.LogWarning("DNS/Network error for Jira URL '{SiteUrl}': {Message}. Please verify the Jira URL is correct and accessible.", siteUrl, ex.Message);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning("HTTP request error for Jira project {ProjectKey}: {Message}. Please check your Jira URL and credentials.", projectKey, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync issues for {ProjectKey}", projectKey);
            throw;
        }
    }

    private int ExtractStoryPoints(Dictionary<string, System.Text.Json.JsonElement>? extensionData)
    {
        if (extensionData == null) return 0;
        
        // Match custom fields known for Story Points, or first reasonable double
        if (extensionData.TryGetValue("customfield_10016", out var sp10016) && sp10016.ValueKind == System.Text.Json.JsonValueKind.Number)
            return (int)Math.Round(sp10016.GetDouble());
            
        if (extensionData.TryGetValue("customfield_10014", out var sp10014) && sp10014.ValueKind == System.Text.Json.JsonValueKind.Number)
            return (int)Math.Round(sp10014.GetDouble());

        foreach (var kvp in extensionData)
        {
            if (kvp.Key.StartsWith("customfield_") && kvp.Value.ValueKind == System.Text.Json.JsonValueKind.Number)
            {
                return (int)Math.Round(kvp.Value.GetDouble());
            }
        }
        return 0;
    }

    public async Task<int> GetIssueCountAsync(string projectKey, string siteUrl, string status)
    {
        try
        {
            var jql = $"project={projectKey} AND status='{status}'";
            var url = $"{siteUrl.TrimEnd('/')}/rest/api/3/search?jql={Uri.EscapeDataString(jql)}&maxResults=0";
            var response = await SendGetAsync(url);
            
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
            var response = await SendGetAsync(url);
            
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

    public async Task<List<JiraBoardResponse>> GetBoardsAsync(string projectKey, string siteUrl)
    {
        var boards = new List<JiraBoardResponse>();
        try
        {
            // Jira Agile API returns boards associated with a project if queried correctly
            var url = $"{siteUrl.TrimEnd('/')}/rest/agile/1.0/board?projectKeyOrId={projectKey.Trim()}";
            var response = await SendGetAsync(url);
            
            if (response.IsSuccessStatusCode)
            {
                var agileResponse = await response.Content.ReadFromJsonAsync<JiraAgileResponse<JiraBoardResponse>>();
                if (agileResponse != null && agileResponse.Values != null)
                {
                    boards.AddRange(agileResponse.Values);
                }
            }
            else
            {
                _logger.LogWarning("Failed to fetch Jira boards for {ProjectKey}. Status: {Status}", projectKey, response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Jira boards for {ProjectKey}", projectKey);
        }
        return boards;
    }

    public async Task<List<JiraSprintResponse>> GetSprintsAsync(long boardId, string siteUrl)
    {
        var sprints = new List<JiraSprintResponse>();
        try
        {
            int startAt = 0;
            int maxResults = 50;
            bool isLast = false;

            while (!isLast)
            {
                var url = $"{siteUrl.TrimEnd('/')}/rest/agile/1.0/board/{boardId}/sprint?startAt={startAt}&maxResults={maxResults}";
                var response = await SendGetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Failed to fetch Sprints for Board {BoardId}. Status: {Status}", boardId, response.StatusCode);
                    break;
                }

                var agileResponse = await response.Content.ReadFromJsonAsync<JiraAgileResponse<JiraSprintResponse>>();
                if (agileResponse == null || agileResponse.Values == null) break;

                sprints.AddRange(agileResponse.Values);
                
                isLast = agileResponse.IsLast;
                startAt += agileResponse.Values.Count;
                
                // Safety break to prevent infinite loops if Jira acts weird
                if (agileResponse.Values.Count == 0 || sprints.Count > 1000) break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Jira sprints for board {BoardId}", boardId);
        }
        return sprints;
    }

    private async Task<HttpResponseMessage> SendGetAsync(string url, string? jiraToken = null)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        SetAuthHeader(request, jiraToken);
        return await _httpClient.SendAsync(request);
    }

    private void SetAuthHeader(HttpRequestMessage request, string? jiraToken = null)
    {
        var projectToken = string.IsNullOrWhiteSpace(jiraToken) ? null : jiraToken.Trim();
        if (!string.IsNullOrEmpty(projectToken))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", projectToken);
            return;
        }

        if (!string.IsNullOrEmpty(_jiraEmail) && !string.IsNullOrEmpty(_jiraApiToken))
        {
            var authString = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_jiraEmail}:{_jiraApiToken}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authString);
        }
    }
}
