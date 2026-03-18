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
    
    public ProjectDashboardService(IUnitOfWork unitOfWork, IDistributedCache cache)
    {
        _unitOfWork = unitOfWork;
        _cache = cache;
    }

    public async Task<ProjectDashboardResponse> GetProjectDashboardAsync(long projectId, long? userId = null)
    {
        var projectIdStr = projectId.ToString();
        var cacheKey = $"PBLPlatform_ProjectDashboard_{projectIdStr}_{(userId?.ToString() ?? "All")}";

        var cachedData = await _cache.GetStringAsync(cacheKey);
        if (!string.IsNullOrEmpty(cachedData))
        {
            return System.Text.Json.JsonSerializer.Deserialize<ProjectDashboardResponse>(cachedData)!;
        }

        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var response = await CalculateDashboardMetrics(projectId, userId);

        var serializedData = System.Text.Json.JsonSerializer.Serialize(response);
        await _cache.SetStringAsync(cacheKey, serializedData, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
        });

        return response;
    }

    private async Task<ProjectDashboardResponse> CalculateDashboardMetrics(long projectId, long? userId)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var activeMembers = project.team_members.Where(tm => tm.participation_status == "ACTIVE").ToList();
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
                Leader = leader != null ? $"{leader.student_user.user.full_name} ({leader.student_user.student_code})" : null
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
                InactiveDays = lastCommitDate.HasValue ?
                    (int)(DateTime.UtcNow - lastCommitDate.Value).TotalDays : 0
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

            dashboard.MemberContributions.Add(new MemberContribution
            {
                StudentUserId = member.student_user_id,
                StudentCode = member.student_user.student_code,
                FullName = member.student_user.user.full_name ?? "",
                Commits30d = activityList.Sum(a => a.commits_count),
                PullRequests30d = activityList.Sum(a => a.pull_requests_count),
                JiraIssuesCompleted30d = activityList.Sum(a => a.issues_completed),
                LastActivityDate = lastActivity.HasValue ? lastActivity.Value.ToDateTime(TimeOnly.MinValue) : null,
                InactiveDays = lastActivity.HasValue ? (int)(DateTime.UtcNow.Date - lastActivity.Value.ToDateTime(TimeOnly.MinValue).Date).TotalDays : 999,
                Alert = lastActivity.HasValue && (DateTime.UtcNow.Date - lastActivity.Value.ToDateTime(TimeOnly.MinValue).Date).TotalDays > 14 ?
                    $"⚠️ Inactive for {(int)(DateTime.UtcNow.Date - lastActivity.Value.ToDateTime(TimeOnly.MinValue).Date).TotalDays} days" : null
            });
        }

        if (userId.HasValue)
        {
            var userContribution = dashboard.MemberContributions.FirstOrDefault(m => m.StudentUserId == userId.Value);
            if (userContribution != null)
            {
                dashboard.UserCommits = userContribution.CommitsCount;
                dashboard.UserIssues = userContribution.IssuesCount;
            }
        }

        dashboard.LastSyncAt = dashboard.GitHubStats?.LastCommitDate > (dashboard.JiraStats?.LastUpdate ?? DateTime.MinValue)
            ? dashboard.GitHubStats?.LastCommitDate 
            : dashboard.JiraStats?.LastUpdate;

        return dashboard;
    }

    public async Task<KanbanBoardResponse> GetProjectKanbanAsync(long projectId)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var response = new KanbanBoardResponse();

        if (project.project_integration?.jira_project_id != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.jira_project_id == project.project_integration.jira_project_id);

            var issuesList = issues.ToList();

            foreach (var issue in issuesList)
            {
                var task = new KanbanTask
                {
                    Id = issue.jira_issue_key,
                    Title = issue.title ?? "No Title",
                    Status = issue.status ?? "To Do",
                    Priority = issue.priority,
                    Type = issue.issue_type
                };

                // Map assignee name if possible
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

                // Group by status
                var statusLower = task.Status.ToLower();
                if (statusLower == "done" || statusLower == "closed" || statusLower == "resolved")
                {
                    response.Columns.Done.Add(task);
                }
                else if (statusLower == "in progress" || statusLower == "doing" || statusLower == "testing")
                {
                    response.Columns.In_Progress.Add(task);
                }
                else
                {
                    response.Columns.Todo.Add(task);
                }
            }
        }

        return response;
    }

    public async Task<CfdBoardResponse> GetProjectCfdAsync(long projectId)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var response = new CfdBoardResponse();
        
        // Fetch last 30 days activity
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var activity = await _unitOfWork.StudentActivityDailies.FindAsync(a => 
            a.project_id == projectId && a.activity_date >= startDate);
        
        var activityList = activity.OrderBy(a => a.activity_date).ToList();
        var groupedByDate = activityList.GroupBy(a => a.activity_date)
            .Select(g => new {
                Date = g.Key,
                Created = g.Sum(x => x.issues_created),
                Completed = g.Sum(x => x.issues_completed)
            }).ToList();

        int cumulativeCreated = 0;
        int cumulativeCompleted = 0;

        foreach (var day in groupedByDate)
        {
            cumulativeCreated += day.Created;
            cumulativeCompleted += day.Completed;

            response.Buckets.Add(new CfdBucket
            {
                Date = day.Date.ToString("yyyy-MM-dd"),
                Done = cumulativeCompleted,
                InProgress = Math.Max(0, (cumulativeCreated - cumulativeCompleted) / 2), // Approximation
                Todo = Math.Max(0, (cumulativeCreated - cumulativeCompleted) / 2)       // Approximation
            });
        }

        return response;
    }

    public async Task<RoadmapResponse> GetProjectRoadmapAsync(long projectId)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var response = new RoadmapResponse();

        if (project.project_integration?.jira_project_id != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.jira_project_id == project.project_integration.jira_project_id);

            // Filter for issues that could be roadmap items (e.g. Epics, Stories or just recently updated)
            var roadmapIssues = issues.OrderByDescending(i => i.updated_at).Take(10);

            foreach (var issue in roadmapIssues)
            {
                response.Items.Add(new RoadmapItem
                {
                    Id = issue.jira_issue_key,
                    Title = issue.title ?? "Untitled",
                    Status = issue.status ?? "To Do",
                    DueDate = issue.updated_at.AddDays(7), // Mocking due date by adding 7 days to last update
                    Assignee = issue.assignee_jira_account_id
                });
            }
        }

        return response;
    }

    public async Task<AgingWipResponse> GetProjectAgingWipAsync(long projectId, int limit = 5)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var response = new AgingWipResponse();

        if (project.project_integration?.jira_project_id != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.jira_project_id == project.project_integration.jira_project_id && (ji.status == "In Progress" || ji.status == "Doing"));

            var agingIssues = issues.OrderByDescending(i => (DateTime.UtcNow - i.updated_at).TotalDays)
                .Take(limit)
                .ToList();

            foreach (var issue in agingIssues)
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
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var response = new CycleTimeResponse();

        if (project.project_integration?.jira_project_id != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.jira_project_id == project.project_integration.jira_project_id && (ji.status == "Done" || ji.status == "Closed"));

            var completedIssues = issues.ToList();
            if (completedIssues.Any())
            {
                var cycleTimes = completedIssues.Select(i => (int)(i.updated_at - i.created_at).TotalDays).OrderBy(d => d).ToList();
                
                response.MedianDays = cycleTimes[cycleTimes.Count / 2];
                response.P75Days = cycleTimes[(int)(cycleTimes.Count * 0.75)];

                // Simple histogram
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
