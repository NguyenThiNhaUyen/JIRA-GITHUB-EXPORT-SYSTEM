using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
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

    public async Task LinkIntegrationAsync(long projectId, LinkIntegrationRequest request)
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
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow
            };

            _unitOfWork.ProjectIntegrations.Add(integration);
        }

        await _unitOfWork.SaveChangesAsync();

        var syncIntegration = await _unitOfWork.ProjectIntegrations.Query()
            .Include(pi => pi.github_repo)
            .Include(pi => pi.jira_project)
            .FirstOrDefaultAsync(pi => pi.project_id == projectId);

        if (syncIntegration != null)
        {
            _ = Task.Run(async () =>
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var githubClient = scope.ServiceProvider.GetRequiredService<IGitHubClient>();
                var jiraClient = scope.ServiceProvider.GetRequiredService<IJiraClient>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<ProjectIntegrationService>>();

                try
                {
                    if (syncIntegration.github_repo != null)
                    {
                        await githubClient.SyncCommitsAsync(syncIntegration.github_repo.id, syncIntegration.github_repo.owner_login, syncIntegration.github_repo.name);
                        await githubClient.SyncPullRequestsAsync(syncIntegration.github_repo.id, syncIntegration.github_repo.owner_login, syncIntegration.github_repo.name);
                    }

                    if (syncIntegration.jira_project != null)
                    {
                        await jiraClient.SyncIssuesAsync(syncIntegration.jira_project.id, syncIntegration.jira_project.jira_project_key, syncIntegration.jira_project.jira_url ?? "https://atlassian.net");
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Background synchronization failed for linked project {ProjectId}", projectId);
                }
            });
        }
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
