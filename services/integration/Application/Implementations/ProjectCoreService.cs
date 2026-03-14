using AutoMapper;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ProjectCoreService : IProjectCoreService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ProjectCoreService> _logger;
    private readonly IGitHubClient _githubClient;
    private readonly IJiraClient _jiraClient;

    public ProjectCoreService(
        IUnitOfWork unitOfWork, 
        IMapper mapper, 
        ILogger<ProjectCoreService> logger,
        IGitHubClient githubClient,
        IJiraClient jiraClient)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _githubClient = githubClient;
        _jiraClient = jiraClient;
    }

    public async Task<ProjectDetailResponse> CreateProjectAsync(CreateProjectRequest request, long courseId)
    {
        var course = await _unitOfWork.Courses.GetByIdAsync(courseId);
        if (course == null)
        {
            _logger.LogWarning("Course not found: {CourseId}", courseId);
            throw new NotFoundException("Course not found");
        }

        var existing = await _unitOfWork.Projects.FirstOrDefaultAsync(p =>
            p.course_id == courseId && p.name == request.Name && p.status == "ACTIVE");

        if (existing != null)
        {
            _logger.LogWarning("Duplicate project name in course {CourseId}", courseId);
            throw new BusinessException("Project with this name already exists in the course");
        }

        var project = new project
        {
            course_id = courseId,
            name = request.Name,
            description = request.Description,
            status = "ACTIVE",
            created_at = DateTime.UtcNow,
            updated_at = DateTime.UtcNow
        };

        _unitOfWork.Projects.Add(project);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ProjectDetailResponse>(project);
    }

    public async Task<ProjectDetailResponse> GetProjectByIdAsync(long projectId)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");
        return _mapper.Map<ProjectDetailResponse>(project);
    }

    public async Task<ProjectDetailResponse> UpdateProjectAsync(long projectId, UpdateProjectRequest request)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        if (project.name != request.Name)
        {
            var existing = await _unitOfWork.Projects.FirstOrDefaultAsync(p =>
                p.course_id == project.course_id && p.name == request.Name && p.status == "ACTIVE");
            if (existing != null) throw new BusinessException("Project with this name already exists in the course");
        }

        project.name = request.Name;
        project.description = request.Description;
        project.updated_at = DateTime.UtcNow;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ProjectDetailResponse>(project);
    }

    public async Task DeleteProjectAsync(long projectId)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null) throw new NotFoundException("Project not found");

        project.status = "INACTIVE";
        project.updated_at = DateTime.UtcNow;

        _unitOfWork.Projects.Update(project);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<PagedResponse<ProjectDetailResponse>> GetProjectsByCourseAsync(long courseId, PagedRequest request)
    {
        var (items, totalItems) = await _unitOfWork.Projects.GetPagedProjectsByCourseAsync(
            courseId,
            request.Q,
            request.SortDir,
            request.Page,
            request.PageSize
        );

        var dtoList = _mapper.Map<List<ProjectDetailResponse>>(items);
        return new PagedResponse<ProjectDetailResponse>(dtoList, totalItems, request.Page, request.PageSize);
    }

    public async Task<List<CommitResponse>> GetProjectCommitsAsync(long projectId, int page = 1, int pageSize = 50)
    {
        var integration = await _unitOfWork.ProjectIntegrations.Query()
            .FirstOrDefaultAsync(i => i.project_id == projectId);

        if (integration?.github_repo_id == null)
            return new List<CommitResponse>();

        var repoId = integration.github_repo_id.Value;

        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Include(c => c.author_github_user)
            .Where(c => c.repo_id == repoId)
            .OrderByDescending(c => c.committed_at)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return commits.Select(c => new CommitResponse
        {
            Id = c.id,
            Sha = c.commit_sha,
            Message = c.message ?? string.Empty,
            AuthorName = c.author_github_user?.login,
            CommittedAt = c.committed_at,
            Additions = c.additions ?? 0,
            Deletions = c.deletions ?? 0,
        }).ToList();
    }

    public async Task<object> SyncProjectCommitsAsync(long projectId)
    {
        var integration = await _unitOfWork.ProjectIntegrations.Query()
            .Include(pi => pi.github_repo)
            .Include(pi => pi.jira_project)
            .Include(pi => pi.project)
            .FirstOrDefaultAsync(pi => pi.project_id == projectId);

        if (integration == null)
        {
            throw new NotFoundException("Integration not found for this project");
        }

        if (integration.project.status != "ACTIVE")
        {
            throw new BusinessException("Cannot sync inactive projects");
        }

        // Fire and forget background sync
        _ = Task.Run(async () =>
        {
            try
            {
                _logger.LogInformation("[ManualSync] Starting background sync for project {ProjectId}: {ProjectName}", 
                    projectId, integration.project.name);

                if (integration.github_repo != null)
                {
                    await _githubClient.SyncCommitsAsync(
                        integration.github_repo.id, 
                        integration.github_repo.owner_login, 
                        integration.github_repo.name);
                    
                    await _githubClient.SyncPullRequestsAsync(
                        integration.github_repo.id, 
                        integration.github_repo.owner_login, 
                        integration.github_repo.name);
                }

                if (integration.jira_project != null)
                {
                    await _jiraClient.SyncIssuesAsync(
                        integration.jira_project.id, 
                        integration.jira_project.jira_project_key, 
                        integration.jira_project.jira_url ?? "https://atlassian.net");
                }

                _logger.LogInformation("[ManualSync] Successfully completed sync for project {ProjectId}", projectId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ManualSync] Failed to sync project {ProjectId}", projectId);
            }
        });

        return new { message = "Sync triggered. Data will be updated in the background.", projectId };
    }
}
