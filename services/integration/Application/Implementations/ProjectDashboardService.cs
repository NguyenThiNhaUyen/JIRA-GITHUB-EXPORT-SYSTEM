using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ProjectDashboardService : IProjectDashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProjectDashboardService> _logger;
    private readonly IDistributedCache _cache;

    public ProjectDashboardService(IUnitOfWork unitOfWork, ILogger<ProjectDashboardService> logger, IDistributedCache cache)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _cache = cache;
    }

    public async Task<ProjectDashboardResponse> GetProjectDashboardAsync(long projectId, long? userId = null)
    {
        _logger.LogInformation("Retrieving dashboard for project {ProjectId} (User: {UserId})", projectId, userId);
        var project = await LoadProjectWithIntegration(projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var dashboard = new ProjectDashboardResponse
        {
            Project = new ProjectSummary
            {
                Id = project.id,
                Name = project.name,
                Status = project.status ?? "ACTIVE"
            }
        };

        var activeMembers = await _unitOfWork.TeamMembers.Query()
            .Include(tm => tm.student_user).ThenInclude(su => su.user)
            .Where(tm => tm.project_id == projectId && tm.participation_status == "ACTIVE")
            .ToListAsync();

        dashboard.TeamSummary = new TeamSummary
        {
            TotalMembers = activeMembers.Count,
            ActiveMembers = activeMembers.Count,
            Leader = activeMembers.FirstOrDefault(m => m.team_role == "LEADER")?.student_user?.user?.full_name
        };

        await PopulateGitHubStats(dashboard, project);
        await PopulateJiraStats(dashboard, project);
        await CalculateWeeklyCommits(dashboard, projectId);
        await PopulateMemberContributions(dashboard, projectId, activeMembers, userId);

        dashboard.LastSyncAt = dashboard.GitHubStats?.LastCommitDate > (dashboard.JiraStats?.LastUpdate ?? DateTime.MinValue)
            ? dashboard.GitHubStats?.LastCommitDate
            : dashboard.JiraStats?.LastUpdate;

        return dashboard;
    }

    private async Task PopulateGitHubStats(ProjectDashboardResponse dashboard, project project)
    {
        if (project.project_integration?.github_repo_id != null)
        {
            var commits = await _unitOfWork.GitHubCommits.FindAsync(gc => gc.repo_id == project.project_integration.github_repo_id);
            var prs = await _unitOfWork.GitHubPullRequests.FindAsync(pr => pr.repo_id == project.project_integration.github_repo_id);

            var commitsList = commits.ToList();
            DateTime? lastCommitDate = commitsList.Any() ? commitsList.Max(c => c.committed_at) : (DateTime?)null;

            dashboard.GitHubStats = new GitHubStats
            {
                TotalCommits = commitsList.Count,
                TotalPullRequests = prs.Count(),
                LastCommitDate = lastCommitDate,
                InactiveDays = lastCommitDate.HasValue ? (int)(DateTime.UtcNow - lastCommitDate.Value).TotalDays : 0
            };
        }
    }

    private async Task PopulateJiraStats(ProjectDashboardResponse dashboard, project project)
    {
        if (project.project_integration?.jira_project_id != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji => ji.jira_project_id == project.project_integration.jira_project_id);
            var issuesList = issues.ToList();
            dashboard.JiraStats = new JiraStats
            {
                TotalIssues = issuesList.Count,
                InProgress = issuesList.Count(i => i.status == "In Progress"),
                Done = issuesList.Count(i => i.status == "Done"),
                LastUpdate = issuesList.Any() ? issuesList.Max(i => i.updated_at) : null
            };
        }
    }

    private async Task CalculateWeeklyCommits(ProjectDashboardResponse dashboard, long projectId)
    {
        var eightyFourDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-84));
        var allProjectActivities = await _unitOfWork.StudentActivityDailies.FindAsync(sad =>
            sad.project_id == projectId && sad.activity_date >= eightyFourDaysAgo);
        
        var activitiesByDate = allProjectActivities.ToList();
        dashboard.WeeklyCommits = new List<int>();
        for (int i = 11; i >= 0; i--)
        {
            var start = eightyFourDaysAgo.AddDays((11 - i) * 7);
            var end = start.AddDays(7);
            var commitsInWeek = activitiesByDate.Where(a => a.activity_date >= start && a.activity_date < end).Sum(a => a.commits_count);
            dashboard.WeeklyCommits.Add(commitsInWeek);
        }
    }

    private async Task PopulateMemberContributions(ProjectDashboardResponse dashboard, long projectId, List<team_member> activeMembers, long? userId)
    {
        var thirtyDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        dashboard.MemberContributions = new List<MemberContribution>();

        foreach (var member in activeMembers)
        {
            var activities = await _unitOfWork.StudentActivityDailies.FindAsync(sad =>
                sad.student_user_id == member.student_user_id && sad.project_id == projectId && sad.activity_date >= thirtyDaysAgo);

            var activityList = activities.ToList();
            DateOnly? maxDate = activityList.Any() ? activityList.Max(a => a.activity_date) : null;
            int inactiveDays = maxDate.HasValue ? (int)(DateTime.UtcNow.Date - maxDate.Value.ToDateTime(TimeOnly.MinValue)).TotalDays : 999;

            dashboard.MemberContributions.Add(new MemberContribution
            {
                StudentUserId = member.student_user_id,
                StudentCode = member.student_user?.student_code ?? "",
                FullName = member.student_user?.user?.full_name ?? "",
                Commits30d = activityList.Sum(a => a.commits_count),
                PullRequests30d = activityList.Sum(a => a.pull_requests_count),
                JiraIssuesCompleted30d = activityList.Sum(a => a.issues_completed),
                LastActivityDate = maxDate?.ToDateTime(TimeOnly.MinValue),
                InactiveDays = inactiveDays,
                Alert = inactiveDays > 14 ? $"⚠️ Inactive for {inactiveDays} days" : null
            });
        }

        if (userId.HasValue)
        {
            var userContrib = dashboard.MemberContributions.FirstOrDefault(m => m.StudentUserId == userId.Value);
            if (userContrib != null)
            {
                dashboard.UserCommits = userContrib.Commits30d;
                dashboard.UserIssues = userContrib.JiraIssuesCompleted30d;
            }
        }
    }

    private async Task<project?> LoadProjectWithIntegration(long projectId)
    {
        return await _unitOfWork.Projects.Query()
            .Include(p => p.project_integration).ThenInclude(pi => pi.github_repo)
            .Include(p => p.project_integration).ThenInclude(pi => pi.jira_project)
            .FirstOrDefaultAsync(p => p.id == projectId);
    }

    // ── Metric-specific endpoints ─────────────────────────────────────────────

    public async Task<KanbanBoardResponse> GetProjectKanbanAsync(long projectId)
    {
        var project = await LoadProjectWithIntegration(projectId);
        if (project == null || project.project_integration?.jira_project_id == null) return new();

        var issues = await _unitOfWork.JiraIssues.FindAsync(ji => ji.jira_project_id == project.project_integration.jira_project_id);
        var issuesList = issues.ToList();

        var res = new KanbanBoardResponse();
        res.Columns.Todo = issuesList.Where(i => i.status == "To Do" || i.status == "Backlog").Select(MapToKanban).ToList();
        res.Columns.In_Progress = issuesList.Where(i => i.status == "In Progress").Select(MapToKanban).ToList();
        res.Columns.Done = issuesList.Where(i => i.status == "Done").Select(MapToKanban).ToList();

        return res;
    }

    private KanbanTask MapToKanban(jira_issue i) => new() {
        Id = i.jira_issue_key, Title = i.title ?? "No title", Status = i.status ?? "Open", 
        Assignee = i.assignee_jira_account_id ?? "Unassigned", Priority = i.priority, Type = i.issue_type, StoryPoint = "0"
    };

    public async Task<CfdBoardResponse> GetProjectCfdAsync(long projectId)
    {
        var project = await LoadProjectWithIntegration(projectId);
        if (project == null || project.project_integration?.jira_project_id == null) return new();

        var issues = await _unitOfWork.JiraIssues.FindAsync(ji => ji.jira_project_id == project.project_integration.jira_project_id);
        var issuesList = issues.ToList();
        
        var days = Enumerable.Range(0, 30).Select(d => DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-29 + d))).ToList();
        var res = new CfdBoardResponse();
        res.Buckets = days.Select(d => new CfdBucket {
            Date = d.ToString("yyyy-MM-dd"),
            Todo = issuesList.Count(i => DateOnly.FromDateTime(i.created_at) <= d && (i.status == "To Do" || i.status == "Backlog")),
            InProgress = issuesList.Count(i => DateOnly.FromDateTime(i.created_at) <= d && i.status == "In Progress"),
            Done = issuesList.Count(i => DateOnly.FromDateTime(i.created_at) <= d && i.status == "Done")
        }).ToList();
        return res;
    }

    public async Task<RoadmapResponse> GetProjectRoadmapAsync(long projectId)
    {
        var project = await LoadProjectWithIntegration(projectId);
        if (project == null || project.project_integration?.jira_project_id == null) return new();

        var issues = await _unitOfWork.JiraIssues.FindAsync(ji => ji.jira_project_id == project.project_integration.jira_project_id);
        return new RoadmapResponse {
            Items = issues.OrderBy(i => i.updated_at).Select(i => new RoadmapItem {
                Id = i.jira_issue_key, Title = i.title ?? "No title", Status = i.status ?? "Open", 
                DueDate = i.updated_at, Assignee = i.assignee_jira_account_id
            }).ToList()
        };
    }

    public async Task<AgingWipResponse> GetProjectAgingWipAsync(long projectId, int limit = 5)
    {
        var project = await LoadProjectWithIntegration(projectId);
        if (project == null || project.project_integration?.jira_project_id == null) return new();

        var issues = await _unitOfWork.JiraIssues.FindAsync(ji => ji.jira_project_id == project.project_integration.jira_project_id && ji.status == "In Progress");
        return new AgingWipResponse {
            Items = issues.Select(i => new AgingWipItem {
                IssueId = i.id.ToString(), Key = i.jira_issue_key, Summary = i.title ?? "No title",
                DaysInProgress = (int)(DateTime.UtcNow - i.updated_at).TotalDays, Assignee = i.assignee_jira_account_id
            }).OrderByDescending(i => i.DaysInProgress).Take(limit).ToList()
        };
    }

    public async Task<CycleTimeResponse> GetProjectCycleTimeAsync(long projectId)
    {
        var project = await LoadProjectWithIntegration(projectId);
        if (project == null || project.project_integration?.jira_project_id == null) return new();

        var issues = await _unitOfWork.JiraIssues.FindAsync(ji => ji.jira_project_id == project.project_integration.jira_project_id && ji.status == "Done");
        var doneIssues = issues.ToList();

        var cycleTimes = doneIssues.Select(i => (i.updated_at - i.created_at).TotalDays).OrderBy(t => t).ToList();

        return new CycleTimeResponse {
            MedianDays = cycleTimes.Any() ? (int)cycleTimes[cycleTimes.Count / 2] : 0,
            P75Days = cycleTimes.Any() ? (int)cycleTimes[(int)(cycleTimes.Count * 0.75)] : 0,
            Histogram = new List<CycleTimeBucket>()
        };
    }
}
