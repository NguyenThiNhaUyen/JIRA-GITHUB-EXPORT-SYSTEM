using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ProjectDashboardService : IProjectDashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDistributedCache _cache;
    private readonly ILogger<ProjectDashboardService> _logger;

    public ProjectDashboardService(IUnitOfWork unitOfWork, IDistributedCache cache, ILogger<ProjectDashboardService> logger)
    {
        _unitOfWork = unitOfWork;
        _cache = cache;
        _logger = logger;
    }

    public async Task<ProjectDashboardResponse> GetProjectDashboardAsync(long projectId, long? userId = null)
    {
        var cacheKey = $"PBLPlatform_ProjectDashboard_{projectId}_{userId?.ToString() ?? "All"}";

        // Bug #5 fix: wrap cache in try-catch — Redis may not be configured on Render
        try
        {
            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedData))
                return System.Text.Json.JsonSerializer.Deserialize<ProjectDashboardResponse>(cachedData)!;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Dashboard] Cache read failed for Project {ProjectId}, computing fresh", projectId);
        }

        // Bug #4 fix: include nav props for existence check
        var projectExists = await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .AnyAsync(p => p.Id == projectId);
        if (!projectExists) throw new NotFoundException("Project not found");

        var response = await CalculateDashboardMetrics(projectId, userId);

        try
        {
            var serializedData = System.Text.Json.JsonSerializer.Serialize(response);
            await _cache.SetStringAsync(cacheKey, serializedData, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Dashboard] Cache write failed for Project {ProjectId}, continuing without cache", projectId);
        }

        return response;
    }

    private async Task<ProjectDashboardResponse> CalculateDashboardMetrics(long projectId, long? userId)
    {
        // Bug #2 & #4 fix: load Project with all required nav props via explicit query + Include
        var Project = await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Include(p => p.TeamMembers)
                .ThenInclude(tm => tm.StudentUser)
                    .ThenInclude(s => s.User)
            .Include(p => p.ProjectIntegration)
                .ThenInclude(pi => pi.GithubRepo)
            .Include(p => p.ProjectIntegration)
                .ThenInclude(pi => pi.JiraProject)
            .Include(p => p.Course)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (Project == null) throw new NotFoundException("Project not found");

        var activeMembers = (Project.TeamMembers ?? new List<JiraGithubExport.Shared.Models.TeamMember>())
            .Where(tm => tm.ParticipationStatus == "ACTIVE").ToList();
        var leader = activeMembers.FirstOrDefault(tm => tm.TeamRole == "LEADER");

        var dashboard = new ProjectDashboardResponse
        {
            Project = new ProjectSummary
            {
                Id = Project.Id,
                Name = Project.Name,
                Status = Project.Status
            },
            TeamSummary = new TeamSummary
            {
                TotalMembers = activeMembers.Count,
                ActiveMembers = activeMembers.Count,
                Leader = leader?.StudentUser?.User != null
                    ? $"{leader.StudentUser.User.FullName} ({leader.StudentUser.StudentCode})"
                    : null
            }
        };

        if (Project.ProjectIntegration.GithubRepoId != null)
        {
            var commits = await _unitOfWork.GitHubCommits.FindAsync(gc =>
                gc.RepoId == Project.ProjectIntegration.GithubRepoId);

            var prs = await _unitOfWork.GitHubPullRequests.FindAsync(pr =>
                pr.RepoId == Project.ProjectIntegration.GithubRepoId);

            var commitsList = commits.ToList();
            var prsList = prs.ToList();
            DateTime? lastCommitDate = commitsList.Any() ? commitsList.Max(c => c.CommittedAt) : (DateTime?)null;

            dashboard.GitHubStats = new GitHubStats
            {
                TotalCommits = commitsList.Count,
                TotalPullRequests = prsList.Count,
                LastCommitDate = lastCommitDate,
                InactiveDays = lastCommitDate.HasValue
                    ? (int)(DateTime.UtcNow - lastCommitDate.Value).TotalDays : 0
            };
        }

        if (Project.ProjectIntegration.JiraProjectId != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.JiraProjectId == Project.ProjectIntegration.JiraProjectId);

            var issuesList = issues.ToList();
            dashboard.JiraStats = new JiraStats
            {
                TotalIssues = issuesList.Count,
                InProgress = issuesList.Count(i => i.Status == "In Progress"),
                Done = issuesList.Count(i => i.Status == "Done"),
                LastUpdate = issuesList.Any() ? issuesList.Max(i => i.UpdatedAt) : null
            };
        }

        var thirtyDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        dashboard.MemberContributions = new List<MemberContribution>();

        foreach (var member in activeMembers)
        {
            var activities = await _unitOfWork.StudentActivityDailies.FindAsync(sad =>
                sad.StudentUserId == member.StudentUserId &&
                sad.ProjectId == projectId &&
                sad.ActivityDate >= thirtyDaysAgo);

            var activityList = activities.ToList();
            DateOnly? lastActivity = activityList.Any() ? activityList.Max(a => a.ActivityDate) : (DateOnly?)null;
            int inactiveDays = lastActivity.HasValue
                ? (int)(DateTime.UtcNow.Date - lastActivity.Value.ToDateTime(TimeOnly.MinValue).Date).TotalDays
                : 999;

            dashboard.MemberContributions.Add(new MemberContribution
            {
                StudentUserId = member.StudentUserId,
                StudentCode = member.StudentUser?.StudentCode ?? "",
                FullName = member.StudentUser?.User?.FullName ?? "",
                Commits30d = activityList.Sum(a => a.CommitsCount),
                PullRequests30d = activityList.Sum(a => a.PullRequestsCount),
                JiraIssuesCompleted30d = activityList.Sum(a => a.IssuesCompleted),
                LastActivityDate = lastActivity.HasValue ? lastActivity.Value.ToDateTime(TimeOnly.MinValue) : null,
                InactiveDays = inactiveDays,
                Alert = inactiveDays > 14 ? $"⚠️ Inactive for {inactiveDays} days" : null
            });
        }

        // Populate personal metrics if userId provided
        if (userId.HasValue)
        {
            var userContrib = dashboard.MemberContributions.FirstOrDefault(m => m.StudentUserId == userId.Value);
            if (userContrib != null)
            {
                dashboard.UserCommits = userContrib.CommitsCount;
                dashboard.UserIssues = userContrib.IssuesCount;
            }
        }

        dashboard.LastSyncAt = dashboard.GitHubStats?.LastCommitDate > (dashboard.JiraStats?.LastUpdate ?? DateTime.MinValue)
            ? dashboard.GitHubStats?.LastCommitDate
            : dashboard.JiraStats?.LastUpdate;

        return dashboard;
    }

    // ── helpers: load Project with integration for sub-endpoints ──────────────

    private async Task<JiraGithubExport.Shared.Models.Project?> LoadProjectWithIntegration(long projectId)
    {
        return await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Include(p => p.ProjectIntegration)
                .ThenInclude(pi => pi!.JiraProject)
            .Include(p => p.ProjectIntegration)
                .ThenInclude(pi => pi!.GithubRepo)
            .FirstOrDefaultAsync(p => p.Id == projectId);
    }

    public async Task<KanbanBoardResponse> GetProjectKanbanAsync(long projectId)
    {
        var Project = await LoadProjectWithIntegration(projectId);
        if (Project == null) throw new NotFoundException("Project not found");

        var response = new KanbanBoardResponse();

        if (Project.ProjectIntegration.JiraProjectId != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.JiraProjectId == Project.ProjectIntegration.JiraProjectId);

            foreach (var issue in issues.ToList())
            {
                var task = new KanbanTask
                {
                    Id = issue.JiraIssueKey,
                    Title = issue.Title ?? "No Title",
                    Status = issue.Status ?? "To Do",
                    Priority = issue.Priority,
                    Type = issue.IssueType
                };

                if (!string.IsNullOrEmpty(issue.AssigneeJiraAccountId))
                {
                    var extAccount = await _unitOfWork.ExternalAccounts.FirstOrDefaultAsync(ea =>
                        ea.Provider == "JIRA" && ea.ExternalUserKey == issue.AssigneeJiraAccountId);
                    if (extAccount != null)
                    {
                        var User = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Id == extAccount.UserId);
                        task.Assignee = User?.FullName ?? issue.AssigneeJiraAccountId;
                    }
                    else
                    {
                        task.Assignee = issue.AssigneeJiraAccountId;
                    }
                }

                var statusLower = task.Status.ToLower();
                if (statusLower == "done" || statusLower == "closed" || statusLower == "resolved")
                    response.Columns.Done.Add(task);
                else if (statusLower == "in progress" || statusLower == "doing" || statusLower == "testing")
                    response.Columns.In_Progress.Add(task);
                else
                    response.Columns.Todo.Add(task);
            }
        }

        return response;
    }

    public async Task<CfdBoardResponse> GetProjectCfdAsync(long projectId)
    {
        // Only need Project existence, no nav props
        var projectExists = await _unitOfWork.Projects.Query().AnyAsync(p => p.Id == projectId);
        if (!projectExists) throw new NotFoundException("Project not found");

        var response = new CfdBoardResponse();
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var activity = await _unitOfWork.StudentActivityDailies.FindAsync(a =>
            a.ProjectId == projectId && a.ActivityDate >= startDate);

        var groupedByDate = activity.OrderBy(a => a.ActivityDate)
            .GroupBy(a => a.ActivityDate)
            .Select(g => new
            {
                Date = g.Key,
                Created = g.Sum(x => x.IssuesCreated),
                Completed = g.Sum(x => x.IssuesCompleted)
            }).ToList();

        int cumulativeCreated = 0, cumulativeCompleted = 0;
        foreach (var day in groupedByDate)
        {
            cumulativeCreated += day.Created;
            cumulativeCompleted += day.Completed;
            response.Buckets.Add(new CfdBucket
            {
                Date = day.Date.ToString("yyyy-MM-dd"),
                Done = cumulativeCompleted,
                InProgress = Math.Max(0, (cumulativeCreated - cumulativeCompleted) / 2),
                Todo = Math.Max(0, (cumulativeCreated - cumulativeCompleted) / 2)
            });
        }

        return response;
    }

    public async Task<RoadmapResponse> GetProjectRoadmapAsync(long projectId)
    {
        var Project = await LoadProjectWithIntegration(projectId);
        if (Project == null) throw new NotFoundException("Project not found");

        var response = new RoadmapResponse();

        if (Project.ProjectIntegration.JiraProjectId != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.JiraProjectId == Project.ProjectIntegration.JiraProjectId);

            foreach (var issue in issues.OrderByDescending(i => i.UpdatedAt).Take(10))
            {
                response.Items.Add(new RoadmapItem
                {
                    Id = issue.JiraIssueKey,
                    Title = issue.Title ?? "Untitled",
                    Status = issue.Status ?? "To Do",
                    DueDate = issue.UpdatedAt.AddDays(7),
                    Assignee = issue.AssigneeJiraAccountId
                });
            }
        }

        return response;
    }

    public async Task<AgingWipResponse> GetProjectAgingWipAsync(long projectId, int limit = 5)
    {
        var Project = await LoadProjectWithIntegration(projectId);
        if (Project == null) throw new NotFoundException("Project not found");

        var response = new AgingWipResponse();

        if (Project.ProjectIntegration.JiraProjectId != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.JiraProjectId == Project.ProjectIntegration.JiraProjectId &&
                (ji.Status == "In Progress" || ji.Status == "Doing"));

            foreach (var issue in issues.OrderByDescending(i => (DateTime.UtcNow - i.UpdatedAt).TotalDays).Take(limit))
            {
                response.Items.Add(new AgingWipItem
                {
                    IssueId = issue.Id.ToString(),
                    Key = issue.JiraIssueKey,
                    Summary = issue.Title ?? "No Summary",
                    DaysInProgress = (int)(DateTime.UtcNow - issue.UpdatedAt).TotalDays,
                    Assignee = issue.AssigneeJiraAccountId
                });
            }
        }

        return response;
    }

    public async Task<CycleTimeResponse> GetProjectCycleTimeAsync(long projectId)
    {
        var Project = await LoadProjectWithIntegration(projectId);
        if (Project == null) throw new NotFoundException("Project not found");

        var response = new CycleTimeResponse();

        if (Project.ProjectIntegration.JiraProjectId != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.JiraProjectId == Project.ProjectIntegration.JiraProjectId &&
                (ji.Status == "Done" || ji.Status == "Closed"));

            var completedIssues = issues.ToList();
            if (completedIssues.Any())
            {
                var cycleTimes = completedIssues
                    .Select(i => (int)(i.UpdatedAt - i.CreatedAt).TotalDays)
                    .OrderBy(d => d)
                    .ToList();

                response.MedianDays = cycleTimes[cycleTimes.Count / 2];
                response.P75Days = cycleTimes[(int)(cycleTimes.Count * 0.75)];

                var maxDays = cycleTimes.Max();
                for (int i = 0; i <= maxDays; i += 5)
                {
                    int end = i + 4;
                    response.Histogram.Add(new CycleTimeBucket
                    {
                        Range = $"{i}-{end}d",
                        Count = cycleTimes.Count(d => d >= i && d <= end)
                    });
                }
            }
        }

        return response;
    }
}
