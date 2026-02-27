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

    public async Task<ProjectDashboardResponse> GetProjectDashboardAsync(long projectId)
    {
        var projectIdStr = projectId.ToString();
        var cacheKey = $"PBLPlatform_ProjectDashboard_{projectIdStr}";

        var cachedData = await _cache.GetStringAsync(cacheKey);
        if (!string.IsNullOrEmpty(cachedData))
        {
            return System.Text.Json.JsonSerializer.Deserialize<ProjectDashboardResponse>(cachedData)!;
        }

        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        var response = await CalculateDashboardMetrics(projectId);

        var serializedData = System.Text.Json.JsonSerializer.Serialize(response);
        await _cache.SetStringAsync(cacheKey, serializedData, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
        });

        return response;
    }

    private async Task<ProjectDashboardResponse> CalculateDashboardMetrics(long projectId)
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

        return dashboard;
    }
}
