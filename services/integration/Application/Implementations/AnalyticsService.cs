using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class AnalyticsService : IAnalyticsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AnalyticsService> _logger;

    public AnalyticsService(IUnitOfWork unitOfWork, ILogger<AnalyticsService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IntegrationStatsResponse> GetIntegrationStatsAsync()
    {
        var totalProjectsTask = _unitOfWork.Projects.Query().CountAsync();
        
        var integrations = await _unitOfWork.ProjectIntegrations.Query().AsNoTracking().ToListAsync();

        int repoConnected = integrations.Count(i => i.github_repo_id.HasValue);
        int jiraConnected = integrations.Count(i => i.jira_project_id.HasValue);

        int totalProjects = await totalProjectsTask;
        int repoMissing = totalProjects - repoConnected;

        // Dummy/Placeholder for SyncErrors and ReportsExported
        int syncErrors = 0; 
        int reportsExported = await _unitOfWork.ReportExports.Query().CountAsync();

        return new IntegrationStatsResponse
        {
            RepoConnected = repoConnected,
            RepoMissing = repoMissing < 0 ? 0 : repoMissing,
            JiraConnected = jiraConnected,
            SyncErrors = syncErrors,
            ReportsExported = reportsExported
        };
    }

    public async Task<ActivityChartResponse> GetActivityChartAsync()
    {
        var ninetyDaysAgo = DateTime.UtcNow.AddDays(-90);
        
        // Fetch commits from last 90 days for Heatmap
        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => c.committed_at >= ninetyDaysAgo)
            .Select(c => new { c.committed_at })
            .ToListAsync();

        // 1. Heatmap (90 days)
        var heatmapData = commits
            .Where(c => c.committed_at.HasValue)
            .GroupBy(c => c.committed_at.Value.Date)
            .Select(g => new HeatmapStat
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                Count = g.Count()
            })
            .OrderBy(h => h.Date)
            .ToList();

        // 2. Commit Chart (Last 7 days logic converted to short day names Mon, Tue)
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7).Date;
        var recentCommits = commits.Where(c => c.committed_at.HasValue && c.committed_at.Value.Date >= sevenDaysAgo).ToList();
        
        var chartData = recentCommits
            .GroupBy(c => c.committed_at.Value.Date.DayOfWeek)
            .Select(g => new DailyCommitStat
            {
                Day = g.Key.ToString().Substring(0, 3), // Mon, Tue...
                Commits = g.Count()
            })
            .ToList();

        // Ensure all 7 days are represented even if 0 commits
        var allDays = new List<string> { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
        var completeChartData = allDays.Select(day => new DailyCommitStat
        {
            Day = day,
            Commits = chartData.FirstOrDefault(c => c.Day == day)?.Commits ?? 0
        }).ToList();

        return new ActivityChartResponse
        {
            CommitChart = completeChartData,
            ContributionHeatmap = heatmapData
        };
    }

    public async Task<TeamAnalyticsResponse> GetTeamAnalyticsAsync()
    {
        // Get active projects with some navigation properties
        var projects = await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Include(p => p.project_integration)
            .Select(p => new 
            {
                p.id,
                ProjectName = p.name,
                p.created_at,
                HasRepo = p.project_integration != null && p.project_integration.github_repo_id.HasValue,
                HasJira = p.project_integration != null && p.project_integration.jira_project_id.HasValue,
                RepoId = p.project_integration != null ? p.project_integration.github_repo_id : null
            })
            .ToListAsync();

        // Fetch commit counts per repo to calculate top active teams
        var repoIds = projects.Where(p => p.HasRepo).Select(p => p.RepoId.Value).ToList();
        
        // Group commits by repo_id
        var repoCommitCounts = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => repoIds.Contains(c.repo_id))
            .GroupBy(c => c.repo_id)
            .Select(g => new { RepoId = g.Key, Count = g.Count(), LastCommit = g.Max(x => x.committed_at) })
            .ToDictionaryAsync(x => x.RepoId);

        var detailedActivity = projects.Select(p => new DetailedTeamActivityStat
        {
            Team = p.ProjectName,
            RepoStatus = p.HasRepo,
            TotalCommits = p.RepoId.HasValue && repoCommitCounts.ContainsKey(p.RepoId.Value) 
                ? repoCommitCounts[p.RepoId.Value].Count : 0,
            LastCommitTime = p.RepoId.HasValue && repoCommitCounts.ContainsKey(p.RepoId.Value) 
                ? repoCommitCounts[p.RepoId.Value].LastCommit : null,
            Status = p.HasRepo ? "ACTIVE" : "MISSING_REPO"
        }).ToList();

        // Mark teams as LOW if repo is connected but 0 commits or last commit was > 14 days ago
        var fourteenDaysAgo = DateTime.UtcNow.AddDays(-14);
        foreach(var stat in detailedActivity.Where(d => d.RepoStatus))
        {
            if (stat.TotalCommits == 0 || (stat.LastCommitTime.HasValue && stat.LastCommitTime.Value < fourteenDaysAgo))
            {
                stat.Status = "LOW";
            }
        }

        // Top Ranking (by Commits)
        var topRanking = detailedActivity
            .Where(d => d.TotalCommits > 0)
            .OrderByDescending(d => d.TotalCommits)
            .Take(5)
            .Select(d => new TeamRankingStat { Team = d.Team, Commits = d.TotalCommits })
            .ToList();

        // Inactive Warning Logic
        var inactiveWarning = new List<TeamWarningStat>();
        foreach (var p in projects)
        {
            if (!p.HasRepo)
            {
                inactiveWarning.Add(new TeamWarningStat { Team = p.ProjectName, Reason = "Repository is empty or missing" });
            }
            else if (!p.HasJira)
            {
                inactiveWarning.Add(new TeamWarningStat { Team = p.ProjectName, Reason = "No Jira connected since creation" });
            }
            else
            {
                var stat = detailedActivity.FirstOrDefault(d => d.Team == p.ProjectName);
                if (stat != null && stat.Status == "LOW")
                {
                    inactiveWarning.Add(new TeamWarningStat { Team = p.ProjectName, Reason = "No commits in the last 14 days" });
                }
            }
        }

        return new TeamAnalyticsResponse
        {
            TopRanking = topRanking,
            InactiveWarning = inactiveWarning.Take(10).ToList(),
            DetailedActivity = detailedActivity.OrderByDescending(d => d.TotalCommits).ToList()
        };
    }

    public async Task<List<AuditLogResponse>> GetRecentAuditLogsAsync(int count = 10)
    {
        var logs = await _unitOfWork.AuditLogs.Query()
            .AsNoTracking()
            .OrderByDescending(a => a.timestamp)
            .Take(count)
            .ToListAsync();

        return logs.Select(l => new AuditLogResponse
        {
            Type = l.action,      
            Message = $"{l.entity_type} {l.entity_id} was updated.", 
            Timestamp = l.timestamp
        }).ToList();
    }
}
