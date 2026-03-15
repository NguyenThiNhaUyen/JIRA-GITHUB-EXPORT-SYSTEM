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

        if (dtoList.Any())
        {
            var repoIds = items.Where(p => p.project_integration?.github_repo_id != null)
                .Select(p => p.project_integration!.github_repo_id!.Value)
                .ToList();
            var jiraIds = items.Where(p => p.project_integration?.jira_project_id != null)
                .Select(p => p.project_integration!.jira_project_id!.Value)
                .ToList();

            var commitCounts = new Dictionary<long, int>();
            if (repoIds.Any())
            {
                commitCounts = await _unitOfWork.GitHubCommits.Query()
                    .Where(c => repoIds.Contains(c.repo_id))
                    .GroupBy(c => c.repo_id)
                    .ToDictionaryAsync(g => g.Key, g => g.Count());
            }

            var issueStats = new Dictionary<long, (int Total, int Done)>();
            if (jiraIds.Any())
            {
                var stats = await _unitOfWork.JiraIssues.Query()
                    .Where(i => jiraIds.Contains(i.jira_project_id))
                    .GroupBy(i => i.jira_project_id)
                    .Select(g => new {
                        JiraId = g.Key,
                        Total = g.Count(),
                        Done = g.Count(i => i.status != null && i.status.ToUpper() == "DONE")
                    })
                    .ToListAsync();

                foreach (var s in stats)
                {
                    issueStats[s.JiraId] = (s.Total, s.Done);
                }
            }

            foreach (var dto in dtoList)
            {
                var project = items.First(p => p.id == dto.Id);
                
                dto.CommitCount = 0;
                dto.IssueCount = 0;
                dto.ProgressPercent = 0;
                dto.RiskScore = 0;

                if (project.project_integration?.github_repo_id != null)
                {
                    var repoId = project.project_integration.github_repo_id.Value;
                    if (commitCounts.TryGetValue(repoId, out int commits))
                    {
                        dto.CommitCount = commits;
                    }
                    
                    // Simple heuristic for risk score out of 100 based on commits (FE needs this)
                    dto.RiskScore = Math.Max(0, 100 - (dto.CommitCount * 2));
                }
                
                if (project.project_integration?.jira_project_id != null)
                {
                    var jiraId = project.project_integration.jira_project_id.Value;
                    if (issueStats.TryGetValue(jiraId, out var stats))
                    {
                        dto.IssueCount = stats.Total;
                        dto.ProgressPercent = stats.Total > 0 ? (int)Math.Round((double)stats.Done * 100 / stats.Total) : 0;
                    }
                }
            }
        }

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

    public async Task<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentCommitHistoryResponse>> GetProjectCommitHistoryAsync(long projectId)
    {
        var result = new List<JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentCommitHistoryResponse>();
        
        // Match members from project
        var members = await _unitOfWork.TeamMembers.Query()
            .AsNoTracking()
            .Include(tm => tm.student_user)
                .ThenInclude(s => s.user)
            .Where(tm => tm.project_id == projectId && tm.participation_status == "ACTIVE")
            .ToListAsync();
            
        if (!members.Any()) return result;

        var integration = await _unitOfWork.ProjectIntegrations.Query()
            .FirstOrDefaultAsync(i => i.project_id == projectId);

        if (integration?.github_repo_id == null)
        {
            // No repo linked, return 0 commits for all
            return members.Select(tm => new JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentCommitHistoryResponse
            {
                StudentUserId = tm.student_user_id,
                StudentName = tm.student_user?.user?.full_name ?? "Unknown",
                StudentCode = tm.student_user?.student_code ?? "Unknown",
                Commits = 0,
                PullRequests = 0
            }).ToList();
        }

        var repoId = integration.github_repo_id.Value;
        
        foreach (var member in members)
        {
            int commits = 0;
            int prs = 0;
            var email = member.student_user?.user?.email;
            
            if (!string.IsNullOrEmpty(email))
            {
                var githubUsers = await _unitOfWork.GitHubUsers.Query()
                    .AsNoTracking()
                    .Where(gu => gu.email != null && gu.email.ToLower() == email.ToLower())
                    .Select(gu => gu.id)
                    .ToListAsync();

                if (githubUsers.Any())
                {
                    commits = await _unitOfWork.GitHubCommits.Query()
                        .AsNoTracking()
                        .Where(c => c.repo_id == repoId && c.author_github_user_id.HasValue && githubUsers.Contains(c.author_github_user_id.Value))
                        .CountAsync();
                        
                    prs = await _unitOfWork.GitHubPullRequests.Query()
                        .AsNoTracking()
                        .Where(pr => pr.repo_id == repoId && pr.author_github_user_id.HasValue && githubUsers.Contains(pr.author_github_user_id.Value))
                        .CountAsync();
                }
            }

            result.Add(new JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentCommitHistoryResponse
            {
                StudentUserId = member.student_user_id,
                StudentName = member.student_user?.user?.full_name ?? "Unknown",
                StudentCode = member.student_user?.student_code ?? "Unknown",
                Commits = commits,
                PullRequests = prs
            });
        }

        return result;
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
