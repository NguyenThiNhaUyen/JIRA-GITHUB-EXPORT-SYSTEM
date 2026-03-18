using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using JiraGithubExport.Shared.Contracts.Requests.Courses;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

/// <summary>
/// Streamlined service for cross-cutting analytics.
/// Responsibilities like Admin/Student/Lecturer stats have been moved to specialized services.
/// </summary>
public class AnalyticsService : IAnalyticsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AnalyticsService> _logger;
    private readonly IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> _hubContext;

    public AnalyticsService(
        IUnitOfWork unitOfWork, 
        ILogger<AnalyticsService> logger,
        IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> hubContext)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _hubContext = hubContext;
    }

    public async Task<IntegrationStatsResponse> GetIntegrationStatsAsync()
    {
        var totalGitHub = await _unitOfWork.GitHubRepositories.Query().CountAsync();
        var totalJira = await _unitOfWork.JiraProjects.Query().CountAsync();
        var linkedProjects = await _unitOfWork.Projects.Query()
            .Where(p => p.ProjectIntegration != null && (p.ProjectIntegration.GithubRepoId != null || p.ProjectIntegration.JiraProjectId != null))
            .CountAsync();

        return new IntegrationStatsResponse { TotalGitHubRepos = totalGitHub,
            TotalJiraProjects = totalJira,
            LinkedProjectsCount = linkedProjects,
            LastSyncAt = DateTime.UtcNow
        };
    }

    public async Task<List<DailyCommitStat>> GetCommitTrendsAsync(int days = 7)
    {
        var since = DateTime.UtcNow.AddDays(-days).Date;
        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => c.CommittedAt >= since)
            .Select(c => new { c.CommittedAt })
            .ToListAsync();

        var allDays = Enumerable.Range(0, days)
            .Select(i => DateTime.UtcNow.AddDays(-days + i + 1).Date)
            .ToList();

        return allDays.Select(d => new DailyCommitStat
        {
            Day = d.ToString("dd/MM"),
            Commits = commits.Count(c => c.CommittedAt.HasValue && c.CommittedAt.Value.Date == d)
        }).ToList();
    }

    public async Task<List<HeatmapStat>> GetHeatmapAsync(int days = 90)
    {
        var since = DateTime.UtcNow.AddDays(-days).Date;
        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => c.CommittedAt >= since)
            .Select(c => new { c.CommittedAt })
            .ToListAsync();

        return commits
            .Where(c => c.CommittedAt.HasValue)
            .GroupBy(c => c.CommittedAt!.Value.Date)
            .Select(g => new HeatmapStat { Date = g.Key.ToString("yyyy-MM-dd"), Count = g.Count() })
            .OrderBy(h => h.Date)
            .ToList();
    }

    public async Task<List<TeamRankingStat>> GetTeamRankingsAsync(int limit = 4)
    {
        var analytics = await GetTeamAnalyticsAsync();
        return analytics.TopRanking.Take(limit).ToList();
    }

    public async Task<List<TeamWarningStat>> GetInactiveTeamsAsync()
    {
        var since = DateTime.UtcNow.AddDays(-7);
        var inactives = await _unitOfWork.Projects.Query()
            .Include(p => p.TeamMembers)
            .Where(p => !p.ProjectIntegration.GithubRepo.GithubCommits.Any(c => c.CommittedAt >= since) && !p.ProjectIntegration.JiraProject.JiraIssues.Any(i => i.UpdatedAt >= since))
            .Take(10)
            .Select(p => new TeamWarningStat 
            { 
                ProjectId = p.Id, 
                TeamName = p.Name ?? "N/A", 
                LastActivity = "HÆ¡n 7 ngĂ y trÆ°á»›c",
                Severity = "HIGH"
            })
            .ToListAsync();

        return inactives;
    }

    public async Task<List<DetailedTeamActivityStat>> GetTeamActivitiesAsync()
    {
        return await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Select(p => new DetailedTeamActivityStat
            {
                ProjectId = p.Id, TeamId = p.Id,
                TeamName = p.Name ?? "N/A",
                CommitsCount = (p.ProjectIntegration != null && p.ProjectIntegration.GithubRepo != null) ? p.ProjectIntegration.GithubRepo.GithubCommits.Count() : 0,
                IssuesCompleted = (p.ProjectIntegration != null && p.ProjectIntegration.JiraProject != null) ? p.ProjectIntegration.JiraProject.JiraIssues.Count(i => i.Status == "Done" || i.Status == "Closed") : 0,
                HealthScore = 85 // Mocked logic
            })
            .OrderByDescending(s => s.CommitsCount)
            .Take(10)
            .ToListAsync();
    }

    public async Task<ActivityChartResponse> GetActivityChartAsync()
    {
        var trends = await GetCommitTrendsAsync(14);
        return new ActivityChartResponse
        {
            Labels = trends.Select(t => t.Day).ToList(),
            Data = trends.Select(t => t.Commits).ToList()
        };
    }

    public async Task<TeamAnalyticsResponse> GetTeamAnalyticsAsync()
    {
        // Complex calculation moved from original implementation for clarity
        return new TeamAnalyticsResponse
        {
            TopRanking = new List<TeamRankingStat>(), // Fill logic here
            LowActivityTeams = new List<TeamWarningStat>()
        };
    }

    public async Task<List<GroupRadarMetricResponse>> GetGroupRadarMetricsAsync(long courseId)
    {
        // Placeholder for complex radar logic
        return new List<GroupRadarMetricResponse>();
    }

    public async Task<CourseContributionResponse> GetCourseContributionsAsync(long courseId)
    {
        // Placeholder for course level contribution logic
        return new CourseContributionResponse();
    }
}
