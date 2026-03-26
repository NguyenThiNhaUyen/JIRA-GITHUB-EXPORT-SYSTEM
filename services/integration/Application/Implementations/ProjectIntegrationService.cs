using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;
using JiraGithubExport.IntegrationService.Hubs;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ProjectIntegrationService : IProjectIntegrationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<ProjectIntegrationService> _logger;
    private readonly IHubContext<NotificationHub> _hub;
    private readonly IAnalyticsService _analyticsService;

    public ProjectIntegrationService(
        IUnitOfWork unitOfWork, 
        IServiceScopeFactory serviceScopeFactory, 
        ILogger<ProjectIntegrationService> logger,
        IHubContext<NotificationHub> hub,
        IAnalyticsService analyticsService)
    {
        _unitOfWork = unitOfWork;
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
        _hub = hub;
        _analyticsService = analyticsService;
    }

    public async Task LinkIntegrationAsync(long projectId, long submittedByUserId, LinkIntegrationRequest request)
    {
        NormalizeLinkIntegrationRequest(request);

        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null)
        {
            _logger.LogWarning("Project not found: {ProjectId}", projectId);
            throw new NotFoundException("Project not found");
        }

        var existingIntegration = await _unitOfWork.ProjectIntegrations.FirstOrDefaultAsync(pi => pi.project_id == projectId);
        long? githubRepoId = existingIntegration?.github_repo_id;
        long? jiraProjectId = existingIntegration?.jira_project_id;

        // 1. Xử lý Github
        if (!string.IsNullOrWhiteSpace(request.GithubRepoUrl))
        {
            var (owner, repoName) = ParseGitHubUrl(request.GithubRepoUrl);
            var githubRepo = await _unitOfWork.GitHubRepositories.FirstOrDefaultAsync(gr => gr.owner_login == owner && gr.name == repoName);
            if (githubRepo == null)
            {
                githubRepo = new github_repository
                {
                    name = repoName,
                    owner_login = owner,
                    full_name = $"{owner}/{repoName}",
                    repo_url = request.GithubRepoUrl,
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                _unitOfWork.GitHubRepositories.Add(githubRepo);
                await _unitOfWork.SaveChangesAsync();
            }
            githubRepoId = githubRepo.id; // TÁI SỬ DỤNG GIÁ TRỊ CŨ HOẶC MỚI MÀ KHÔNG THROW LỖI
        }
        else
        {
            githubRepoId = null;
        }

        // 2. Xử lý Jira
        if (!string.IsNullOrWhiteSpace(request.JiraProjectKey))
        {
            var jiraProject = await _unitOfWork.JiraProjects.FirstOrDefaultAsync(jp => jp.jira_project_key == request.JiraProjectKey);
            if (jiraProject == null)
            {
                jiraProject = new jira_project
                {
                    jira_project_key = request.JiraProjectKey,
                    project_name = request.JiraProjectKey,
                    jira_url = request.JiraSiteUrl ?? "https://atlassian.net",
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                _unitOfWork.JiraProjects.Add(jiraProject);
                await _unitOfWork.SaveChangesAsync();
            }
            jiraProjectId = jiraProject.id; // TÁI SỬ DỤNG LẠI KHÔNG THROW LỖI
        }
        else
        {
            jiraProjectId = null;
        }

        // 3. Cập nhật hoặc Thêm mới Integration
        if (existingIntegration != null)
        {
            existingIntegration.github_repo_id = githubRepoId;
            existingIntegration.jira_project_id = jiraProjectId;
            existingIntegration.jira_token = request.JiraToken;
            existingIntegration.github_token = request.GithubToken;
            existingIntegration.approval_status = "PENDING";
            existingIntegration.submitted_by_user_id = submittedByUserId;
            existingIntegration.submitted_at = DateTime.UtcNow;
            existingIntegration.approved_by_user_id = null;
            existingIntegration.approved_at = null;
            existingIntegration.rejected_reason = null;
            existingIntegration.updated_at = DateTime.UtcNow;
            _unitOfWork.ProjectIntegrations.Update(existingIntegration);
        }
        else
        {
            var integration = new project_integration
            {
                project_id = projectId,
                github_repo_id = githubRepoId,
                jira_project_id = jiraProjectId,
                jira_token = request.JiraToken,
                github_token = request.GithubToken,
                approval_status = "PENDING",
                submitted_by_user_id = submittedByUserId,
                submitted_at = DateTime.UtcNow,
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow
            };
            _unitOfWork.ProjectIntegrations.Add(integration);
        }

        await _unitOfWork.SaveChangesAsync();

        try
        {
            var p = await _unitOfWork.Projects.Query()
                .Include(proj => proj.course).ThenInclude(c => c.lecturer_users)
                .FirstOrDefaultAsync(proj => proj.id == projectId);
            
            if (p?.course?.lecturer_users != null && p.course.lecturer_users.Any())
            {
                var msg = $"Nhóm '{p.name}' vừa cập nhật liên kết Github/Jira. Vui lòng phê duyệt.";
                foreach (var l in p.course.lecturer_users)
                {
                    await _analyticsService.BuildNotificationAsync(l.user_id, "LINKS_SUBMITTED", msg, 
                        System.Text.Json.JsonSerializer.Serialize(new { ProjectId = projectId }));
                }
            }
        }
        catch (Exception ex) { _logger.LogWarning(ex, "SignalR notification failed"); }

        _logger.LogInformation("Integration submitted for project {ProjectId} by user {UserId}, status=PENDING", projectId, submittedByUserId);
    }

    public async Task ApproveIntegrationAsync(long projectId, long approvedByUserId)
    {
        var integration = await _unitOfWork.ProjectIntegrations.Query()
            .Include(pi => pi.github_repo)
            .Include(pi => pi.jira_project)
            .FirstOrDefaultAsync(pi => pi.project_id == projectId);

        if (integration == null)
            throw new NotFoundException("No integration found for this project");

        if (integration.approval_status == "APPROVED")
            throw new ValidationException("Integration is already approved");

        integration.approval_status = "APPROVED";
        integration.approved_by_user_id = approvedByUserId;
        integration.approved_at = DateTime.UtcNow;
        integration.rejected_reason = null;
        integration.updated_at = DateTime.UtcNow;
        _unitOfWork.ProjectIntegrations.Update(integration);
        await _unitOfWork.SaveChangesAsync();

        try
        {
            var members = await _unitOfWork.TeamMembers.Query()
                .Where(tm => tm.project_id == projectId && tm.participation_status == "ACTIVE")
                .ToListAsync();
            
            var msg = $"Tuyệt vời! Liên kết dự án của nhóm '{integration.project?.name}' đã được phê duyệt. Hệ thống đang bắt đầu đồng bộ dữ liệu.";
            foreach (var m in members)
            {
                await _analyticsService.BuildNotificationAsync(m.student_user_id, "LINKS_APPROVED", msg, 
                    System.Text.Json.JsonSerializer.Serialize(new { ProjectId = projectId }));
            }
        }
        catch (Exception ex) { _logger.LogWarning(ex, "SignalR notification failed"); }

        _logger.LogInformation("Integration approved for project {ProjectId} by lecturer {UserId}", projectId, approvedByUserId);

        // Trigger initial sync now that it's approved
        _ = Task.Run(async () =>
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var githubClient = scope.ServiceProvider.GetRequiredService<IGitHubClient>();
            var jiraClient = scope.ServiceProvider.GetRequiredService<IJiraClient>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ProjectIntegrationService>>();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            try
            {
                // Re-fetch in background scope to avoid using potentially stale entity instance
                var approvedIntegration = await unitOfWork.ProjectIntegrations.Query()
                    .Include(pi => pi.github_repo)
                    .Include(pi => pi.jira_project)
                    .FirstOrDefaultAsync(pi => pi.project_id == projectId && pi.approval_status == "APPROVED");

                if (approvedIntegration == null)
                {
                    logger.LogWarning("Approved integration not found in background sync for project {ProjectId}", projectId);
                    return;
                }

                if (approvedIntegration.github_repo != null)
                {
                    await githubClient.SyncCommitsAsync(
                        approvedIntegration.github_repo.id,
                        approvedIntegration.github_repo.owner_login,
                        approvedIntegration.github_repo.name,
                        approvedIntegration.github_token
                    );
                    await githubClient.SyncPullRequestsAsync(
                        approvedIntegration.github_repo.id,
                        approvedIntegration.github_repo.owner_login,
                        approvedIntegration.github_repo.name,
                        approvedIntegration.github_token
                    );
                }

                if (approvedIntegration.jira_project != null)
                {
                    await jiraClient.SyncIssuesAsync(
                        approvedIntegration.jira_project.id,
                        approvedIntegration.jira_project.jira_project_key,
                        approvedIntegration.jira_project.jira_url ?? "https://atlassian.net",
                        approvedIntegration.jira_token
                    );
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Background sync failed after approval for project {ProjectId}", projectId);
            }
        });
    }

    public async Task RejectIntegrationAsync(long projectId, long rejectedByUserId, string? reason)
    {
        var integration = await _unitOfWork.ProjectIntegrations.FirstOrDefaultAsync(pi => pi.project_id == projectId);

        if (integration == null)
            throw new NotFoundException("No integration found for this project");

        integration.approval_status = "REJECTED";
        integration.approved_by_user_id = rejectedByUserId;
        integration.approved_at = null;
        integration.rejected_reason = reason;
        integration.updated_at = DateTime.UtcNow;
        _unitOfWork.ProjectIntegrations.Update(integration);
        await _unitOfWork.SaveChangesAsync();

        try
        {
            var members = await _unitOfWork.TeamMembers.Query()
                .Where(tm => tm.project_id == projectId && tm.participation_status == "ACTIVE")
                .ToListAsync();
            
            var msg = $"Liên kết dự án của nhóm vừa bị từ chối. Lý do: {reason ?? "Không rõ"}. Vui lòng kiểm tra lại.";
            foreach (var m in members)
            {
                await _analyticsService.BuildNotificationAsync(m.student_user_id, "LINKS_REJECTED", msg, 
                    System.Text.Json.JsonSerializer.Serialize(new { ProjectId = projectId }));
            }
        }
        catch (Exception ex) { _logger.LogWarning(ex, "SignalR notification failed"); }

        _logger.LogInformation("Integration rejected for project {ProjectId} by lecturer {UserId}. Reason: {Reason}", projectId, rejectedByUserId, reason);
    }

    public async Task<IntegrationInfo?> GetIntegrationStatusAsync(long projectId)
    {
        var integration = await _unitOfWork.ProjectIntegrations
            .Query()
            .Include(pi => pi.github_repo)
            .Include(pi => pi.jira_project)
            .Include(pi => pi.approved_by)
            .FirstOrDefaultAsync(pi => pi.project_id == projectId);

        if (integration == null) return null;

        return new IntegrationInfo
        {
            ApprovalStatus = integration.approval_status ?? "PENDING",
            GithubStatus = integration.approval_status ?? "PENDING",
            JiraStatus = integration.approval_status ?? "PENDING",
            GithubRepoUrl = integration.github_repo?.repo_url,
            GithubUrl = integration.github_repo?.repo_url,
            GithubRepoOwner = integration.github_repo?.owner_login,
            GithubRepoName = integration.github_repo?.name,
            JiraProjectKey = integration.jira_project?.jira_project_key,
            JiraSiteUrl = integration.jira_project?.jira_url,
            JiraUrl = integration.jira_project?.jira_url,
            SubmittedByUserId = integration.submitted_by_user_id,
            SubmittedAt = integration.submitted_at,
            ApprovedByUserId = integration.approved_by_user_id,
            ApprovedByName = integration.approved_by?.full_name,
            ApprovedAt = integration.approved_at,
            RejectedReason = integration.rejected_reason
        };
    }

    private (string owner, string repoName) ParseGitHubUrl(string url)
    {
        var uri = new Uri(url.StartsWith("http") ? url : "https://" + url);
        var segments = uri.AbsolutePath.Trim('/').Split('/');

        if (segments.Length < 2)
        {
            throw new ValidationException("Invalid GitHub repository URL");
        }

        return (segments[0], segments[1].Replace(".git", ""));
    }

    private static void NormalizeLinkIntegrationRequest(LinkIntegrationRequest request)
    {
        request.GithubRepoUrl = string.IsNullOrWhiteSpace(request.GithubRepoUrl) ? null : request.GithubRepoUrl.Trim();
        request.JiraSiteUrl = string.IsNullOrWhiteSpace(request.JiraSiteUrl) ? null : request.JiraSiteUrl.Trim();
        request.JiraProjectKey = string.IsNullOrWhiteSpace(request.JiraProjectKey) ? null : request.JiraProjectKey.Trim().ToUpperInvariant();
        request.JiraToken = string.IsNullOrWhiteSpace(request.JiraToken) ? null : request.JiraToken.Trim();
        request.GithubToken = string.IsNullOrWhiteSpace(request.GithubToken) ? null : request.GithubToken.Trim();

        if (!string.IsNullOrWhiteSpace(request.JiraSiteUrl))
        {
            var (siteUrl, projectKey) = ParseJiraUrlOrKey(request.JiraSiteUrl);
            request.JiraSiteUrl = siteUrl;
            if (string.IsNullOrWhiteSpace(request.JiraProjectKey) && !string.IsNullOrWhiteSpace(projectKey))
            {
                request.JiraProjectKey = projectKey;
            }
        }
    }

    private static (string siteUrl, string? projectKey) ParseJiraUrlOrKey(string input)
    {
        var trimmed = input.Trim();
        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri))
        {
            // Input can be only project key (e.g. "PBL123")
            return ("https://atlassian.net", trimmed.ToUpperInvariant());
        }

        var siteUrl = $"{uri.Scheme}://{uri.Host}";
        var segments = uri.AbsolutePath.Trim('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
        var projectKey = TryExtractJiraProjectKey(segments);
        return (siteUrl, projectKey);
    }

    private static string? TryExtractJiraProjectKey(string[] segments)
    {
        if (segments.Length == 0) return null;

        for (var i = 0; i < segments.Length - 1; i++)
        {
            if (segments[i].Equals("browse", StringComparison.OrdinalIgnoreCase) ||
                segments[i].Equals("projects", StringComparison.OrdinalIgnoreCase))
            {
                var next = segments[i + 1];
                if (!string.IsNullOrWhiteSpace(next))
                {
                    var key = next.Split('-', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? next;
                    return key.ToUpperInvariant();
                }
            }
        }

        return null;
    }
}
