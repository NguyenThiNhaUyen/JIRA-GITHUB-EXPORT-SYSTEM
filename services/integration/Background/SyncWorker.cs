using JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Background;

public class SyncWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SyncWorker> _logger;
    private readonly TimeSpan _syncInterval = TimeSpan.FromMinutes(30);

    public SyncWorker(IServiceProvider serviceProvider, ILogger<SyncWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Sync Worker starting...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await DoSyncAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Sync Worker cancelled gracefully.");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during sync process");
            }

            await Task.Delay(_syncInterval, stoppingToken);
        }

        _logger.LogInformation("Sync Worker stopping...");
    }

    private async Task DoSyncAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var githubClient = scope.ServiceProvider.GetRequiredService<IGitHubClient>();
        var jiraClient = scope.ServiceProvider.GetRequiredService<IJiraClient>();

        // Get all active integration project
        var integrations = await unitOfWork.ProjectIntegrations.Query()
            .Include(pi => pi.github_repo)
            .Include(pi => pi.jira_project)
            .Include(pi => pi.project)
            .Where(pi => pi.project.status == "ACTIVE")
            .ToListAsync(stoppingToken);

        _logger.LogInformation("Found {Count} active integrations to sync", integrations.Count);

        foreach (var integration in integrations)
        {
            if (stoppingToken.IsCancellationRequested) break;

            try
            {
                // Sync GitHub
                if (integration.github_repo != null)
                {
                    _logger.LogDebug("Syncing GitHub for project: {ProjectName}", integration.project.name);
                    await githubClient.SyncCommitsAsync(integration.github_repo.id, integration.github_repo.owner_login, integration.github_repo.name);
                    await githubClient.SyncPullRequestsAsync(integration.github_repo.id, integration.github_repo.owner_login, integration.github_repo.name);
                }

                if (integration.jira_project != null)
                {
                    _logger.LogDebug("Syncing Jira for project: {ProjectName}", integration.project.name);
                    await jiraClient.SyncIssuesAsync(integration.jira_project.id, integration.jira_project.jira_project_key, integration.jira_project.jira_url ?? "https://atlassian.net");
                }
                
                _logger.LogInformation("Successfully synced integration for project {ProjectName} (ID: {ProjectId})", integration.project.name, integration.project_id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to sync integration for project {ProjectId}. Will retry in next cycle.", integration.project_id);
                // Continue to next integration instead of stopping
                continue;
            }
        }
        
        _logger.LogInformation("Sync cycle completed at {Time}", DateTime.UtcNow);
    }
}








