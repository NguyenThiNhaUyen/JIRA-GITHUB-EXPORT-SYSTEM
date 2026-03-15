using AutoMapper;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.Extensions.Logging;
<<<<<<< HEAD
=======
using Microsoft.EntityFrameworkCore;
using JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;
>>>>>>> origin

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ProjectCoreService : IProjectCoreService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ProjectCoreService> _logger;
<<<<<<< HEAD

    public ProjectCoreService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ProjectCoreService> logger)
=======
    private readonly IGitHubClient _githubClient;
    private readonly IJiraClient _jiraClient;

    public ProjectCoreService(
        IUnitOfWork unitOfWork, 
        IMapper mapper, 
        ILogger<ProjectCoreService> logger,
        IGitHubClient githubClient,
        IJiraClient jiraClient)
>>>>>>> origin
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
<<<<<<< HEAD
=======
        _githubClient = githubClient;
        _jiraClient = jiraClient;
>>>>>>> origin
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
<<<<<<< HEAD
        return new PagedResponse<ProjectDetailResponse>(dtoList, totalItems, request.Page, request.PageSize);
    }
=======

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

            var lastCommitByRepo = new Dictionary<long, DateTime?>();
            var prCounts2 = new Dictionary<long, int>();
            if (repoIds.Any())
            {
                prCounts2 = await _unitOfWork.GitHubPullRequests.Query()
                    .Where(pr => repoIds.Contains(pr.repo_id))
                    .GroupBy(pr => pr.repo_id)
                    .ToDictionaryAsync(g => g.Key, g => g.Count());

                var lastCommitData = await _unitOfWork.GitHubCommits.Query()
                    .Where(c => repoIds.Contains(c.repo_id) && c.committed_at.HasValue)
                    .GroupBy(c => c.repo_id)
                    .Select(g => new { RepoId = g.Key, Last = g.Max(x => x.committed_at) })
                    .ToListAsync();
                foreach (var lc in lastCommitData)
                    lastCommitByRepo[lc.RepoId] = lc.Last;
            }

            var srsExportsByProject = await _unitOfWork.ReportExports.Query()
                .Where(r => r.report_type == "SRS" && r.scope == "PROJECT")
                .GroupBy(r => r.scope_entity_id)
                .Select(g => new { ProjectId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ProjectId, x => x.Count);

            foreach (var dto in dtoList)
            {
                var project = items.First(p => p.id == dto.Id);
                
                dto.CommitCount = 0;
                dto.Commits = 0;
                dto.IssueCount = 0;
                dto.ProgressPercent = 0;
                dto.SprintCompletion = 0;
                dto.RiskScore = 0;
                dto.CourseCode = project.course?.course_code ?? "";
                dto.CourseName = project.course?.course_name ?? dto.CourseName;
                dto.TeamSize = project.team_members.Count(tm => tm.participation_status == "ACTIVE");

                if (project.project_integration?.github_repo_id != null)
                {
                    var repoId = project.project_integration.github_repo_id.Value;
                    if (commitCounts.TryGetValue(repoId, out int commits))
                    {
                        dto.CommitCount = commits;
                        dto.Commits = commits;
                    }
                    if (prCounts2.TryGetValue(repoId, out int prCount))
                        dto.PrsMerged = prCount;
                    if (lastCommitByRepo.TryGetValue(repoId, out var lastCommit) && lastCommit.HasValue)
                    {
                        var mins = (int)(DateTime.UtcNow - lastCommit.Value).TotalMinutes;
                        dto.LastCommit = mins < 60 ? $"{mins} phút trước"
                            : mins < 1440 ? $"{mins / 60} giờ trước"
                            : $"{mins / 1440} ngày trước";
                        dto.LastActivity = lastCommit.Value;
                    }
                    dto.RiskScore = Math.Max(0, 100 - (dto.CommitCount * 2));
                }
                
                if (project.project_integration?.jira_project_id != null)
                {
                    var jiraId = project.project_integration.jira_project_id.Value;
                    if (issueStats.TryGetValue(jiraId, out var stats))
                    {
                        dto.IssueCount = stats.Total;
                        dto.IssuesDone = stats.Done;
                        dto.OpenIssues = stats.Total - stats.Done;
                        dto.ProgressPercent = stats.Total > 0 ? (int)Math.Round((double)stats.Done * 100 / stats.Total) : 0;
                        dto.SprintCompletion = dto.ProgressPercent;
                    }
                }

                dto.SrsVersions = srsExportsByProject.GetValueOrDefault(project.id, 0);
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
        
        // Get all commits for this repo once for efficiency
        var allRepoCommits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => c.repo_id == repoId && c.author_github_user_id.HasValue)
            .Select(c => new { c.author_github_user_id, c.committed_at, c.additions, c.deletions })
            .ToListAsync();

        int totalRepoCommits = allRepoCommits.Count;
        var ninetyDaysAgo = DateTime.UtcNow.AddDays(-90);
        
        foreach (var member in members)
        {
            int commits = 0, prs = 0, linesAdded = 0, linesDeleted = 0;
            List<long> githubUserIds = new();
            var email = member.student_user?.user?.email ?? "";
            
            if (!string.IsNullOrEmpty(email))
            {
                githubUserIds = await _unitOfWork.GitHubUsers.Query()
                    .AsNoTracking()
                    .Where(gu => gu.email != null && gu.email.ToLower() == email.ToLower())
                    .Select(gu => gu.id)
                    .ToListAsync();
            }

            DateTime? lastCommitAt = null;
            var studentCommits = new List<DateTime>();
            var weeklyCommits = new List<int>(new int[12]); // 12 weeks
            var heatmapDict = new Dictionary<string, int>();

            if (githubUserIds.Any())
            {
                var myCommits = allRepoCommits
                    .Where(c => c.author_github_user_id.HasValue && githubUserIds.Contains(c.author_github_user_id.Value))
                    .ToList();

                commits = myCommits.Count;
                linesAdded = myCommits.Sum(c => c.additions ?? 0);
                linesDeleted = myCommits.Sum(c => c.deletions ?? 0);
                lastCommitAt = myCommits.Where(c => c.committed_at.HasValue).Select(c => c.committed_at!.Value).DefaultIfEmpty().Max();

                // Weekly commits (last 12 weeks, index 0 = oldest)
                for (int w = 0; w < 12; w++)
                {
                    var wStart = DateTime.UtcNow.AddDays(-((12 - w) * 7));
                    var wEnd = wStart.AddDays(7);
                    weeklyCommits[w] = myCommits.Count(c => c.committed_at.HasValue && c.committed_at.Value >= wStart && c.committed_at.Value < wEnd);
                }

                // Heatmap last 90 days
                heatmapDict = myCommits
                    .Where(c => c.committed_at.HasValue && c.committed_at.Value >= ninetyDaysAgo)
                    .GroupBy(c => c.committed_at!.Value.Date.ToString("yyyy-MM-dd"))
                    .ToDictionary(g => g.Key, g => g.Count());

                prs = await _unitOfWork.GitHubPullRequests.Query()
                    .AsNoTracking()
                    .Where(pr => pr.repo_id == repoId && pr.author_github_user_id.HasValue && githubUserIds.Contains(pr.author_github_user_id.Value))
                    .CountAsync();
            }

            var heatmapData = heatmapDict
                .Select(kv => new JiraGithubExport.Shared.Contracts.Responses.Analytics.HeatmapStat { Date = kv.Key, Count = kv.Value })
                .OrderBy(h => h.Date)
                .ToList();

            result.Add(new JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentCommitHistoryResponse
            {
                StudentId = member.student_user_id,
                StudentUserId = member.student_user_id,
                StudentName = member.student_user?.user?.full_name ?? "Unknown",
                StudentCode = member.student_user?.student_code ?? "Unknown",
                Email = email,
                TotalCommits = commits,
                Commits = commits,
                LinesAdded = linesAdded,
                LinesDeleted = linesDeleted,
                PullRequests = prs,
                ContributionPercent = totalRepoCommits > 0 ? Math.Round((double)commits * 100 / totalRepoCommits, 1) : 0,
                WeeklyCommits = weeklyCommits,
                HeatmapData = heatmapData,
                LastCommitAt = lastCommitAt
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
>>>>>>> origin
}
