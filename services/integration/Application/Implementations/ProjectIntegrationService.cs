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
        var Project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        if (Project == null)
        {
            _logger.LogWarning("Project not found: {ProjectId}", projectId);
            throw new NotFoundException("Project not found");
        }

        var existingIntegration = await _unitOfWork.ProjectIntegrations.FirstOrDefaultAsync(pi => pi.ProjectId == projectId);

        if (existingIntegration != null)
        {
            if (!string.IsNullOrEmpty(request.GithubRepoUrl))
            {
                var (owner, repoName) = ParseGitHubUrl(request.GithubRepoUrl);
                var githubRepo = await _unitOfWork.GitHubRepositories.FirstOrDefaultAsync(gr =>
                    gr.OwnerLogin == owner && gr.Name == repoName);

                if (githubRepo == null)
                {
                    githubRepo = new GithubRepository
                    {
                        Name = repoName,
                        OwnerLogin = owner,
                        FullName = $"{owner}/{repoName}",
                        RepoUrl = request.GithubRepoUrl,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _unitOfWork.GitHubRepositories.Add(githubRepo);
                    await _unitOfWork.SaveChangesAsync();
                }

                existingIntegration.GithubRepoId = githubRepo.Id;
            }

            if (!string.IsNullOrEmpty(request.JiraProjectKey))
            {
                var jiraProject = await _unitOfWork.JiraProjects.FirstOrDefaultAsync(jp =>
                    jp.JiraProjectKey == request.JiraProjectKey);

                if (jiraProject == null)
                {
                    jiraProject = new JiraProject
                    {
                        JiraProjectKey = request.JiraProjectKey,
                        ProjectName = request.JiraProjectKey,
                        JiraUrl = request.JiraSiteUrl ?? "https://atlassian.net",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _unitOfWork.JiraProjects.Add(jiraProject);
                    await _unitOfWork.SaveChangesAsync();
                }

                existingIntegration.JiraProjectId = jiraProject.Id;
            }

            // Reset to PENDING when leader re-submits
            existingIntegration.ApprovalStatus = "PENDING";
            existingIntegration.SubmittedByUserId = submittedByUserId;
            existingIntegration.SubmittedAt = DateTime.UtcNow;
            existingIntegration.ApprovedByUserId = null;
            existingIntegration.ApprovedAt = null;
            existingIntegration.RejectedReason = null;
            existingIntegration.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.ProjectIntegrations.Update(existingIntegration);
        }
        else
        {
            long? GithubRepoId = null;
            long? JiraProjectId = null;

            if (!string.IsNullOrEmpty(request.GithubRepoUrl))
            {
                var (owner, repoName) = ParseGitHubUrl(request.GithubRepoUrl);
                var githubRepo = new GithubRepository
                {
                    Name = repoName,
                    OwnerLogin = owner,
                    FullName = $"{owner}/{repoName}",
                    RepoUrl = request.GithubRepoUrl,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _unitOfWork.GitHubRepositories.Add(githubRepo);
                await _unitOfWork.SaveChangesAsync();
                GithubRepoId = githubRepo.Id;
            }

            if (!string.IsNullOrEmpty(request.JiraProjectKey))
            {
                var jiraProject = new JiraProject
                {
                    JiraProjectKey = request.JiraProjectKey,
                    ProjectName = request.JiraProjectKey,
                    JiraUrl = request.JiraSiteUrl ?? "https://atlassian.net",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _unitOfWork.JiraProjects.Add(jiraProject);
                await _unitOfWork.SaveChangesAsync();
                JiraProjectId = jiraProject.Id;
            }

            var integration = new ProjectIntegration
            {
                ProjectId = projectId,
                GithubRepoId = GithubRepoId,
                JiraProjectId = JiraProjectId,
                ApprovalStatus = "PENDING",
                SubmittedByUserId = submittedByUserId,
                SubmittedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _unitOfWork.ProjectIntegrations.Add(integration);
        }

        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Integration submitted for Project {ProjectId} by User {UserId}, Status=PENDING", projectId, submittedByUserId);
    }

    public async Task ApproveIntegrationAsync(long projectId, long approvedByUserId)
    {
        var integration = await _unitOfWork.ProjectIntegrations.Query()
            .Include(pi => pi.GithubRepo)
            .Include(pi => pi.JiraProject)
            .FirstOrDefaultAsync(pi => pi.ProjectId == projectId);

        if (integration == null)
            throw new NotFoundException("No integration found for this Project");

        if (integration.ApprovalStatus == "APPROVED")
            throw new ValidationException("Integration is already approved");

        integration.ApprovalStatus = "APPROVED";
        integration.ApprovedByUserId = approvedByUserId;
        integration.ApprovedAt = DateTime.UtcNow;
        integration.RejectedReason = null;
        integration.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.ProjectIntegrations.Update(integration);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Integration approved for Project {ProjectId} by Lecturer {UserId}", projectId, approvedByUserId);

        // Trigger initial sync now that it's approved
        _ = Task.Run(async () =>
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var githubClient = scope.ServiceProvider.GetRequiredService<IGitHubClient>();
            var jiraClient = scope.ServiceProvider.GetRequiredService<IJiraClient>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ProjectIntegrationService>>();

            try
            {
                if (integration.GithubRepo != null)
                {
                    await githubClient.SyncCommitsAsync(integration.GithubRepo.Id, integration.GithubRepo.OwnerLogin, integration.GithubRepo.Name);
                    await githubClient.SyncPullRequestsAsync(integration.GithubRepo.Id, integration.GithubRepo.OwnerLogin, integration.GithubRepo.Name);
                }

                if (integration.JiraProject != null)
                {
                    await jiraClient.SyncIssuesAsync(integration.JiraProject.Id, integration.JiraProject.JiraProjectKey, integration.JiraProject.JiraUrl ?? "https://atlassian.net");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Background sync failed after approval for Project {ProjectId}", projectId);
            }
        });
    }

    public async Task RejectIntegrationAsync(long projectId, long rejectedByUserId, string? reason)
    {
        var integration = await _unitOfWork.ProjectIntegrations.FirstOrDefaultAsync(pi => pi.ProjectId == projectId);

        if (integration == null)
            throw new NotFoundException("No integration found for this Project");

        integration.ApprovalStatus = "REJECTED";
        integration.ApprovedByUserId = rejectedByUserId;
        integration.ApprovedAt = null;
        integration.RejectedReason = reason;
        integration.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.ProjectIntegrations.Update(integration);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Integration rejected for Project {ProjectId} by Lecturer {UserId}. Reason: {Reason}", projectId, rejectedByUserId, reason);
    }

    public async Task<IntegrationInfo?> GetIntegrationStatusAsync(long projectId)
    {
        var integration = await _unitOfWork.ProjectIntegrations
            .Query()
            .Include(pi => pi.GithubRepo)
            .Include(pi => pi.JiraProject)
            .Include(pi => pi.ApprovedBy)
            .FirstOrDefaultAsync(pi => pi.ProjectId == projectId);

        if (integration == null) return null;

        return new IntegrationInfo
        {
            ApprovalStatus = integration.ApprovalStatus ?? "PENDING",
            GithubStatus = integration.ApprovalStatus ?? "PENDING",
            JiraStatus = integration.ApprovalStatus ?? "PENDING",
            GithubRepoUrl = integration.GithubRepo?.RepoUrl,
            GithubUrl = integration.GithubRepo?.RepoUrl,
            GithubRepoOwner = integration.GithubRepo?.OwnerLogin,
            GithubRepoName = integration.GithubRepo?.Name,
            JiraProjectKey = integration.JiraProject?.JiraProjectKey,
            JiraSiteUrl = integration.JiraProject?.JiraUrl,
            JiraUrl = integration.JiraProject?.JiraUrl,
            SubmittedByUserId = integration.SubmittedByUserId,
            SubmittedAt = integration.SubmittedAt,
            ApprovedByUserId = integration.ApprovedByUserId,
            ApprovedByName = integration.ApprovedBy?.FullName,
            ApprovedAt = integration.ApprovedAt,
            RejectedReason = integration.RejectedReason
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

