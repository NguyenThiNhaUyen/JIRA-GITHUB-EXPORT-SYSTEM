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

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ProjectIntegrationService : IProjectIntegrationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<ProjectIntegrationService> _logger;

    public ProjectIntegrationService(IUnitOfWork unitOfWork, IServiceScopeFactory serviceScopeFactory, ILogger<ProjectIntegrationService> logger)
    {
        _unitOfWork = unitOfWork;
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
    }

    public async Task LinkIntegrationAsync(long projectId, long submittedByUserId, LinkIntegrationRequest request)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null)
        {
            _logger.LogWarning("Project not found: {ProjectId}", projectId);
            throw new NotFoundException("Project not found");
        }

        var existingIntegration = await _unitOfWork.ProjectIntegrations.FirstOrDefaultAsync(pi => pi.project_id == projectId);

        if (existingIntegration != null)
        {
            if (!string.IsNullOrEmpty(request.GithubRepoUrl))
            {
                var (owner, repoName) = ParseGitHubUrl(request.GithubRepoUrl);
                var githubRepo = await _unitOfWork.GitHubRepositories.FirstOrDefaultAsync(gr =>
                    gr.owner_login == owner && gr.name == repoName);

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

                existingIntegration.github_repo_id = githubRepo.id;
            }

            if (!string.IsNullOrEmpty(request.JiraProjectKey))
            {
                var jiraProject = await _unitOfWork.JiraProjects.FirstOrDefaultAsync(jp =>
                    jp.jira_project_key == request.JiraProjectKey);

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

                existingIntegration.jira_project_id = jiraProject.id;
            }

            // Reset to PENDING when leader re-submits
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
            long? githubRepoId = null;
            long? jiraProjectId = null;

            if (!string.IsNullOrEmpty(request.GithubRepoUrl))
            {
                var (owner, repoName) = ParseGitHubUrl(request.GithubRepoUrl);
                var githubRepo = new github_repository
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
                githubRepoId = githubRepo.id;
            }

            if (!string.IsNullOrEmpty(request.JiraProjectKey))
            {
                var jiraProject = new jira_project
                {
                    jira_project_key = request.JiraProjectKey,
                    project_name = request.JiraProjectKey,
                    jira_url = request.JiraSiteUrl ?? "https://atlassian.net",
                    created_at = DateTime.UtcNow,
                    updated_at = DateTime.UtcNow
                };
                _unitOfWork.JiraProjects.Add(jiraProject);
                await _unitOfWork.SaveChangesAsync();
                jiraProjectId = jiraProject.id;
            }

            var integration = new project_integration
            {
                project_id = projectId,
                github_repo_id = githubRepoId,
                jira_project_id = jiraProjectId,
                approval_status = "PENDING",
                submitted_by_user_id = submittedByUserId,
                submitted_at = DateTime.UtcNow,
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow
            };

            _unitOfWork.ProjectIntegrations.Add(integration);
        }

        await _unitOfWork.SaveChangesAsync();
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

        _logger.LogInformation("Integration approved for project {ProjectId} by lecturer {UserId}", projectId, approvedByUserId);

        // Trigger initial sync now that it's approved
        _ = Task.Run(async () =>
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var githubClient = scope.ServiceProvider.GetRequiredService<IGitHubClient>();
            var jiraClient = scope.ServiceProvider.GetRequiredService<IJiraClient>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ProjectIntegrationService>>();

            try
            {
                if (integration.github_repo != null)
                {
                    await githubClient.SyncCommitsAsync(integration.github_repo.id, integration.github_repo.owner_login, integration.github_repo.name);
                    await githubClient.SyncPullRequestsAsync(integration.github_repo.id, integration.github_repo.owner_login, integration.github_repo.name);
                }

                if (integration.jira_project != null)
                {
                    await jiraClient.SyncIssuesAsync(integration.jira_project.id, integration.jira_project.jira_project_key, integration.jira_project.jira_url ?? "https://atlassian.net");
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

        _logger.LogInformation("Integration rejected for project {ProjectId} by lecturer {UserId}. Reason: {Reason}", projectId, rejectedByUserId, reason);
    }

    public async Task<IntegrationInfo?> GetIntegrationStatusAsync(long projectId)
    {
        var integration = await _unitOfWork.Projects
            .Query()
            .Where(p => p.id == projectId)
            .Select(p => p.project_integration)
            .FirstOrDefaultAsync();

        if (integration == null) return null;

        return new IntegrationInfo
        {
            ApprovalStatus = integration.approval_status,
            GithubRepoUrl = integration.github_repo?.repo_url,
            GithubRepoOwner = integration.github_repo?.owner_login,
            GithubRepoName = integration.github_repo?.name,
            JiraProjectKey = integration.jira_project?.jira_project_key,
            JiraSiteUrl = integration.jira_project?.jira_url,
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
}
