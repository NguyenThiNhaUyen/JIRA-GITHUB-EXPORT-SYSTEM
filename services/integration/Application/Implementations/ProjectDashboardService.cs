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
            _logger.LogWarning(ex, "[Dashboard] Cache read failed for project {ProjectId}, computing fresh", projectId);
        }

        // Bug #4 fix: include nav props for existence check
        var projectExists = await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .AnyAsync(p => p.id == projectId);
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
            _logger.LogWarning(ex, "[Dashboard] Cache write failed for project {ProjectId}, continuing without cache", projectId);
        }

        return response;
    }

    private async Task<ProjectDashboardResponse> CalculateDashboardMetrics(long projectId, long? userId)
    {
        // Bug #2 & #4 fix: load project with all required nav props via explicit query + Include
        var project = await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Include(p => p.team_members)
                .ThenInclude(tm => tm.student_user)
                    .ThenInclude(s => s.user)
            .Include(p => p.project_integration)
                .ThenInclude(pi => pi.github_repo)
            .Include(p => p.project_integration)
                .ThenInclude(pi => pi.jira_project)
            .Include(p => p.course)
            .FirstOrDefaultAsync(p => p.id == projectId);

        if (project == null) throw new NotFoundException("Project not found");

        var activeMembers = (project.team_members ?? new List<JiraGithubExport.Shared.Models.team_member>())
            .Where(tm => tm.participation_status == "ACTIVE").ToList();
        var leader = activeMembers.FirstOrDefault(tm => tm.team_role == "LEADER");

        var dashboard = new ProjectDashboardResponse
        {
            Project = new ProjectSummary
            {
                Id = project.id,
                Name = project.name,
                Status = project.status
            },
            TeamSummary = new TeamSummary
            {
                TotalMembers = activeMembers.Count,
                ActiveMembers = activeMembers.Count,
                Leader = leader?.student_user?.user != null
                    ? $"{leader.student_user.user.full_name} ({leader.student_user.student_code})"
                    : null
            }
        };

        if (project.project_integration?.github_repo_id != null)
        {
            var commits = await _unitOfWork.GitHubCommits.FindAsync(gc =>
                gc.repo_id == project.project_integration.github_repo_id);

            var prs = await _unitOfWork.GitHubPullRequests.FindAsync(pr =>
                pr.repo_id == project.project_integration.github_repo_id);

            var commitsList = commits.ToList();
            var prsList = prs.ToList();
            DateTime? lastCommitDate = commitsList.Any() ? commitsList.Max(c => c.committed_at) : (DateTime?)null;

            dashboard.GitHubStats = new GitHubStats
            {
                TotalCommits = commitsList.Count,
                TotalPullRequests = prsList.Count,
                LastCommitDate = lastCommitDate,
                InactiveDays = lastCommitDate.HasValue
                    ? (int)(DateTime.UtcNow - lastCommitDate.Value).TotalDays : 0
            };
        }

        if (project.project_integration?.jira_project_id != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.jira_project_id == project.project_integration.jira_project_id);

            var issuesList = issues.ToList();
            dashboard.JiraStats = new JiraStats
            {
                TotalIssues = issuesList.Count,
                InProgress = issuesList.Count(i => i.status == "In Progress"),
                Done = issuesList.Count(i => i.status == "Done"),
                LastUpdate = issuesList.Any() ? issuesList.Max(i => i.updated_at) : null
            };
        }

        var thirtyDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        dashboard.MemberContributions = new List<MemberContribution>();

        foreach (var member in activeMembers)
        {
            var activities = await _unitOfWork.StudentActivityDailies.FindAsync(sad =>
                sad.student_user_id == member.student_user_id &&
                sad.project_id == projectId &&
                sad.activity_date >= thirtyDaysAgo);

            var activityList = activities.ToList();
            DateOnly? lastActivity = activityList.Any() ? activityList.Max(a => a.activity_date) : (DateOnly?)null;
            int inactiveDays = lastActivity.HasValue
                ? (int)(DateTime.UtcNow.Date - lastActivity.Value.ToDateTime(TimeOnly.MinValue).Date).TotalDays
                : 999;

            dashboard.MemberContributions.Add(new MemberContribution
            {
                StudentUserId = member.student_user_id,
                StudentCode = member.student_user?.student_code ?? "",
                FullName = member.student_user?.user?.full_name ?? "",
                Commits30d = activityList.Sum(a => a.commits_count),
                PullRequests30d = activityList.Sum(a => a.pull_requests_count),
                JiraIssuesCompleted30d = activityList.Sum(a => a.issues_completed),
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

    // ── helpers: load project with integration for sub-endpoints ──────────────

    private async Task<JiraGithubExport.Shared.Models.project?> LoadProjectWithIntegration(long projectId)
    {
        return await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Include(p => p.project_integration)
                .ThenInclude(pi => pi!.jira_project)
            .Include(p => p.project_integration)
                .ThenInclude(pi => pi!.github_repo)
            .FirstOrDefaultAsync(p => p.id == projectId);
    }

    public async Task<KanbanBoardResponse> GetProjectKanbanAsync(long projectId)
    {
        var project = await LoadProjectWithIntegration(projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var response = new KanbanBoardResponse();

        if (project.project_integration?.jira_project_id != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.jira_project_id == project.project_integration.jira_project_id);

            foreach (var issue in issues.ToList())
            {
                var task = new KanbanTask
                {
                    Id = issue.jira_issue_key,
                    Title = issue.title ?? "No Title",
                    Status = issue.status ?? "To Do",
                    Priority = issue.priority,
                    Type = issue.issue_type
                };

                if (!string.IsNullOrEmpty(issue.assignee_jira_account_id))
                {
                    var extAccount = await _unitOfWork.ExternalAccounts.FirstOrDefaultAsync(ea =>
                        ea.provider == "JIRA" && ea.external_user_key == issue.assignee_jira_account_id);
                    if (extAccount != null)
                    {
                        var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.id == extAccount.user_id);
                        task.Assignee = user?.full_name ?? issue.assignee_jira_account_id;
                    }
                    else
                    {
                        task.Assignee = issue.assignee_jira_account_id;
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
        // Only need project existence, no nav props
        var projectExists = await _unitOfWork.Projects.Query().AnyAsync(p => p.id == projectId);
        if (!projectExists) throw new NotFoundException("Project not found");

        var response = new CfdBoardResponse();
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var activity = await _unitOfWork.StudentActivityDailies.FindAsync(a =>
            a.project_id == projectId && a.activity_date >= startDate);

        var groupedByDate = activity.OrderBy(a => a.activity_date)
            .GroupBy(a => a.activity_date)
            .Select(g => new
            {
                Date = g.Key,
                Created = g.Sum(x => x.issues_created),
                Completed = g.Sum(x => x.issues_completed)
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
        var project = await LoadProjectWithIntegration(projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var response = new RoadmapResponse();

        if (project.project_integration?.jira_project_id != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.jira_project_id == project.project_integration.jira_project_id);

            foreach (var issue in issues.OrderByDescending(i => i.updated_at).Take(10))
            {
                response.Items.Add(new RoadmapItem
                {
                    Id = issue.jira_issue_key,
                    Title = issue.title ?? "Untitled",
                    Status = issue.status ?? "To Do",
                    DueDate = issue.updated_at.AddDays(7),
                    Assignee = issue.assignee_jira_account_id
                });
            }
        }

        return response;
    }

    public async Task<AgingWipResponse> GetProjectAgingWipAsync(long projectId, int limit = 5)
    {
        var project = await LoadProjectWithIntegration(projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var response = new AgingWipResponse();

        if (project.project_integration?.jira_project_id != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.jira_project_id == project.project_integration.jira_project_id &&
                (ji.status == "In Progress" || ji.status == "Doing"));

            foreach (var issue in issues.OrderByDescending(i => (DateTime.UtcNow - i.updated_at).TotalDays).Take(limit))
            {
                response.Items.Add(new AgingWipItem
                {
                    IssueId = issue.id.ToString(),
                    Key = issue.jira_issue_key,
                    Summary = issue.title ?? "No Summary",
                    DaysInProgress = (int)(DateTime.UtcNow - issue.updated_at).TotalDays,
                    Assignee = issue.assignee_jira_account_id
                });
            }
        }

        return response;
    }

    public async Task<CycleTimeResponse> GetProjectCycleTimeAsync(long projectId)
    {
        var project = await LoadProjectWithIntegration(projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var response = new CycleTimeResponse();

        if (project.project_integration?.jira_project_id != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.jira_project_id == project.project_integration.jira_project_id &&
                (ji.status == "Done" || ji.status == "Closed"));

            var completedIssues = issues.ToList();
            if (completedIssues.Any())
            {
                var cycleTimes = completedIssues
                    .Select(i => (int)(i.updated_at - i.created_at).TotalDays)
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
