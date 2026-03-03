using System.Diagnostics;
using JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

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

        // Use PeriodicTimer for robust loop execution
        using var timer = new PeriodicTimer(_syncInterval);

        // Run the first sync immediately
        try
        {
            await TryAcquireLockAndSyncAsync(stoppingToken);
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Sync Worker cancelled during initial run.");
            return;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Initial sync failed, will retry on next cycle.");
        }

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await TryAcquireLockAndSyncAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Sync Worker cancelled gracefully.");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during sync process, continuing to next cycle.");
            }
        }

        _logger.LogInformation("Sync Worker stopping...");
    }

    private async Task TryAcquireLockAndSyncAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var multiplexer = scope.ServiceProvider.GetRequiredService<IConnectionMultiplexer>();
        var db = multiplexer.GetDatabase();

        var lockKey = "syncworker:lock";
        var lockToken = Guid.NewGuid().ToString();
        var lockExpiry = TimeSpan.FromMinutes(20);

        // Attempt to acquire distributed lock
        bool acquired = await db.StringSetAsync(lockKey, lockToken, lockExpiry, When.NotExists);

        if (!acquired)
        {
            _logger.LogInformation("Another instance is currently syncing. Skipping this cycle (Lock not acquired).");
            return;
        }

        _logger.LogInformation("Acquired Redis lock. Starting sync cycle...");
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await DoSyncAsync(scope, stoppingToken);
        }
        finally
        {
            stopwatch.Stop();
            _logger.LogInformation("Sync cycle finished in {ElapsedMilliseconds} ms", stopwatch.ElapsedMilliseconds);

            // Release the lock safely using Lua script
            var releaseScript = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
            await db.ScriptEvaluateAsync(releaseScript, new RedisKey[] { lockKey }, new RedisValue[] { lockToken });
            _logger.LogInformation("Redis lock released.");
        }
    }

    private async Task DoSyncAsync(IServiceScope scope, CancellationToken stoppingToken)
    {
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
        
        _logger.LogInformation("Sync logic completed at {Time}", DateTime.UtcNow);
    }
}








