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
        var Course = await _unitOfWork.Courses.GetByIdAsync(courseId);
        if (Course == null)
        {
            _logger.LogWarning("Course not found: {CourseId}", courseId);
            throw new NotFoundException("Course not found");
        }

        var existing = await _unitOfWork.Projects.FirstOrDefaultAsync(p =>
            p.CourseId == courseId && p.Name == request.Name && p.Status == "ACTIVE");

        if (existing != null)
        {
            _logger.LogWarning("Duplicate Project name in Course {CourseId}", courseId);
            throw new BusinessException("Project with this name already exists in the Course");
        }

        var Project = new Project
        {
            CourseId = courseId,
            Name = request.Name,
            Description = request.Description,
            Status = "ACTIVE",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _unitOfWork.Projects.Add(Project);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ProjectDetailResponse>(Project);
    }

    public async Task<ProjectDetailResponse> GetProjectByIdAsync(long projectId)
    {
        // Bug #4 fix: Include all nav props required by mapper and response DTO
        var Project = await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Include(p => p.Course)
            .Include(p => p.TeamMembers)
                .ThenInclude(tm => tm.StudentUser)
                    .ThenInclude(s => s.User)
            .Include(p => p.ProjectIntegration)
                .ThenInclude(pi => pi!.GithubRepo)
            .Include(p => p.ProjectIntegration)
                .ThenInclude(pi => pi!.JiraProject)
            .Include(p => p.ProjectIntegration)
                .ThenInclude(pi => pi!.ApprovedBy)
            .FirstOrDefaultAsync(p => p.Id == projectId);
        if (Project == null) throw new NotFoundException("Project not found");
        return _mapper.Map<ProjectDetailResponse>(Project);
    }

    public async Task<ProjectDetailResponse> UpdateProjectAsync(long projectId, UpdateProjectRequest request)
    {
        // Bug #4 fix: include nav props needed after save so mapper can read them
        var Project = await _unitOfWork.Projects.Query()
            .Include(p => p.Course)
            .Include(p => p.TeamMembers)
                .ThenInclude(tm => tm.StudentUser)
                    .ThenInclude(s => s.User)
            .Include(p => p.ProjectIntegration)
                .ThenInclude(pi => pi!.GithubRepo)
            .Include(p => p.ProjectIntegration)
                .ThenInclude(pi => pi!.JiraProject)
            .Include(p => p.ProjectIntegration)
                .ThenInclude(pi => pi!.ApprovedBy)
            .FirstOrDefaultAsync(p => p.Id == projectId);
        if (Project == null) throw new NotFoundException("Project not found");

        if (Project.Name != request.Name)
        {
            var existing = await _unitOfWork.Projects.FirstOrDefaultAsync(p =>
                p.CourseId == Project.CourseId && p.Name == request.Name && p.Status == "ACTIVE");
            if (existing != null) throw new BusinessException("Project with this name already exists in the Course");
        }

        Project.Name = request.Name;
        Project.Description = request.Description;
        Project.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Projects.Update(Project);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ProjectDetailResponse>(Project);
    }

    public async Task DeleteProjectAsync(long projectId)
    {
        var Project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        if (Project == null) throw new NotFoundException("Project not found");

        Project.Status = "INACTIVE";
        Project.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Projects.Update(Project);
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
            var repoIds = items.Where(p => p.ProjectIntegration.GithubRepoId != null)
                .Select(p => p.ProjectIntegration.GithubRepoId!.Value)
                .ToList();
            var jiraIds = items.Where(p => p.ProjectIntegration.JiraProjectId != null)
                .Select(p => p.ProjectIntegration.JiraProjectId!.Value)
                .ToList();

            var commitCounts = new Dictionary<long, int>();
            if (repoIds.Any())
            {
                commitCounts = await _unitOfWork.GitHubCommits.Query()
                    .Where(c => repoIds.Contains(c.RepoId))
                    .GroupBy(c => c.RepoId)
                    .ToDictionaryAsync(g => g.Key, g => g.Count());
            }

            var issueStats = new Dictionary<long, (int Total, int Done)>();
            if (jiraIds.Any())
            {
                var stats = await _unitOfWork.JiraIssues.Query()
                    .Where(i => jiraIds.Contains(i.JiraProjectId))
                    .GroupBy(i => i.JiraProjectId)
                    .Select(g => new {
                        JiraId = g.Key,
                        Total = g.Count(),
                        Done = g.Count(i => i.Status != null && i.Status.ToUpper() == "DONE")
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
                    .Where(pr => repoIds.Contains(pr.RepoId))
                    .GroupBy(pr => pr.RepoId)
                    .ToDictionaryAsync(g => g.Key, g => g.Count());

                var lastCommitData = await _unitOfWork.GitHubCommits.Query()
                    .Where(c => repoIds.Contains(c.RepoId) && c.CommittedAt.HasValue)
                    .GroupBy(c => c.RepoId)
                    .Select(g => new { RepoId = g.Key, Last = g.Max(x => x.CommittedAt) })
                    .ToListAsync();
                foreach (var lc in lastCommitData)
                    lastCommitByRepo[lc.RepoId] = lc.Last;
            }

            // Bug #3 fix: wrap ReportExports in try-catch â€” table may not exist or have schema mismatch
            Dictionary<long, int> srsExportsByProject;
            try
            {
                srsExportsByProject = await _unitOfWork.ReportExports.Query()
                    .Where(r => r.ReportType == "SRS" && r.Scope == "Project")
                    .GroupBy(r => r.ScopeEntityId)
                    .Select(g => new { ProjectId = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.ProjectId, x => x.Count);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[GetProjectsByCourse] ReportExports query failed, using empty dict");
                srsExportsByProject = new Dictionary<long, int>();
            }

            foreach (var dto in dtoList)
            {
                var Project = items.First(p => p.Id == dto.Id);
                
                dto.CommitCount = 0;
                dto.Commits = 0;
                dto.IssueCount = 0;
                dto.ProgressPercent = 0;
                dto.SprintCompletion = 0;
                dto.RiskScore = 0;
                dto.CourseCode = Project.Course?.CourseCode ?? "";
                dto.CourseName = Project.Course?.CourseName ?? dto.CourseName;
                dto.TeamSize = Project.TeamMembers.Count(tm => tm.ParticipationStatus == "ACTIVE");

                if (Project.ProjectIntegration.GithubRepoId != null)
                {
                    var repoId = Project.ProjectIntegration.GithubRepoId.Value;
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
                        dto.LastCommit = mins < 60 ? $"{mins} phĂºt trÆ°á»›c"
                            : mins < 1440 ? $"{mins / 60} giá» trÆ°á»›c"
                            : $"{mins / 1440} ngĂ y trÆ°á»›c";
                        dto.LastActivity = lastCommit.Value;
                    }
                    dto.RiskScore = Math.Max(0, 100 - (dto.CommitCount * 2));
                }
                
                if (Project.ProjectIntegration.JiraProjectId != null)
                {
                    var jiraId = Project.ProjectIntegration.JiraProjectId.Value;
                    if (issueStats.TryGetValue(jiraId, out var stats))
                    {
                        dto.IssueCount = stats.Total;
                        dto.IssuesDone = stats.Done;
                        dto.OpenIssues = stats.Total - stats.Done;
                        dto.ProgressPercent = stats.Total > 0 ? (int)Math.Round((double)stats.Done * 100 / stats.Total) : 0;
                        dto.SprintCompletion = dto.ProgressPercent;
                    }
                }

                dto.SrsVersions = srsExportsByProject.GetValueOrDefault(Project.Id, 0);
            }
        }

        return new PagedResponse<ProjectDetailResponse>(dtoList, totalItems, request.Page, request.PageSize);
    }

    public async Task<List<CommitResponse>> GetProjectCommitsAsync(long projectId, int page = 1, int pageSize = 50)
    {
        var integration = await _unitOfWork.ProjectIntegrations.Query()
            .FirstOrDefaultAsync(i => i.ProjectId == projectId);

        if (integration?.GithubRepoId == null)
            return new List<CommitResponse>();

        var repoId = integration.GithubRepoId.Value;

        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Include(c => c.AuthorGithubUser)
            .Where(c => c.RepoId == repoId)
            .OrderByDescending(c => c.CommittedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return commits.Select(c => new CommitResponse
        {
            Id = c.Id,
            Sha = c.CommitSha,
            Message = c.Message ?? string.Empty,
            AuthorName = c.AuthorGithubUser?.Login,
            CommittedAt = c.CommittedAt,
            Additions = c.Additions ?? 0,
            Deletions = c.Deletions ?? 0,
        }).ToList();
    }

    public async Task<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentCommitHistoryResponse>> GetProjectCommitHistoryAsync(long projectId)
    {
        var result = new List<JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentCommitHistoryResponse>();
        
        // Match members from Project
        var members = await _unitOfWork.TeamMembers.Query()
            .AsNoTracking()
            .Include(tm => tm.StudentUser)
                .ThenInclude(s => s.User)
            .Where(tm => tm.ProjectId == projectId && tm.ParticipationStatus == "ACTIVE")
            .ToListAsync();
            
        if (!members.Any()) return result;

        var integration = await _unitOfWork.ProjectIntegrations.Query()
            .FirstOrDefaultAsync(i => i.ProjectId == projectId);

        if (integration?.GithubRepoId == null)
        {
            // No repo linked, return 0 commits for all
            return members.Select(tm => new JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentCommitHistoryResponse
            {
                StudentUserId = tm.StudentUserId,
                StudentName = tm.StudentUser?.User?.FullName ?? "Unknown",
                StudentCode = tm.StudentUser?.StudentCode ?? "Unknown",
                Commits = 0,
                PullRequests = 0
            }).ToList();
        }

        var repoId = integration.GithubRepoId.Value;
        
        // Get all commits for this repo once for efficiency
        var allRepoCommits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => c.RepoId == repoId && c.AuthorGithubUserId.HasValue)
            .Select(c => new { c.AuthorGithubUserId, c.CommittedAt, c.Additions, c.Deletions })
            .ToListAsync();

        int totalRepoCommits = allRepoCommits.Count;
        var ninetyDaysAgo = DateTime.UtcNow.AddDays(-90);
        
        foreach (var member in members)
        {
            int commits = 0, prs = 0, linesAdded = 0, linesDeleted = 0;
            List<long> githubUserIds = new();
            var Email = member.StudentUser?.User?.Email ?? "";
            
            if (!string.IsNullOrEmpty(Email))
            {
                githubUserIds = await _unitOfWork.GitHubUsers.Query()
                    .AsNoTracking()
                    .Where(gu => gu.Email != null && gu.Email.ToLower() == Email.ToLower())
                    .Select(gu => gu.Id)
                    .ToListAsync();
            }

            DateTime? lastCommitAt = null;
            var studentCommits = new List<DateTime>();
            var weeklyCommits = new List<int>(new int[12]); // 12 weeks
            var heatmapDict = new Dictionary<string, int>();

            if (githubUserIds.Any())
            {
                var myCommits = allRepoCommits
                    .Where(c => c.AuthorGithubUserId.HasValue && githubUserIds.Contains(c.AuthorGithubUserId.Value))
                    .ToList();

                commits = myCommits.Count;
                linesAdded = myCommits.Sum(c => c.Additions ?? 0);
                linesDeleted = myCommits.Sum(c => c.Deletions ?? 0);
                lastCommitAt = myCommits.Where(c => c.CommittedAt.HasValue).Select(c => c.CommittedAt!.Value).DefaultIfEmpty().Max();

                // Weekly commits (last 12 weeks, index 0 = oldest)
                for (int w = 0; w < 12; w++)
                {
                    var wStart = DateTime.UtcNow.AddDays(-((12 - w) * 7));
                    var wEnd = wStart.AddDays(7);
                    weeklyCommits[w] = myCommits.Count(c => c.CommittedAt.HasValue && c.CommittedAt.Value >= wStart && c.CommittedAt.Value < wEnd);
                }

                // Heatmap last 90 days
                heatmapDict = myCommits
                    .Where(c => c.CommittedAt.HasValue && c.CommittedAt.Value >= ninetyDaysAgo)
                    .GroupBy(c => c.CommittedAt!.Value.Date.ToString("yyyy-MM-dd"))
                    .ToDictionary(g => g.Key, g => g.Count());

                prs = await _unitOfWork.GitHubPullRequests.Query()
                    .AsNoTracking()
                    .Where(pr => pr.RepoId == repoId && pr.AuthorGithubUserId.HasValue && githubUserIds.Contains(pr.AuthorGithubUserId.Value))
                    .CountAsync();
            }

            var heatmapData = heatmapDict
                .Select(kv => new JiraGithubExport.Shared.Contracts.Responses.Analytics.HeatmapStat { Date = kv.Key, Count = kv.Value })
                .OrderBy(h => h.Date)
                .ToList();

            result.Add(new JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentCommitHistoryResponse
            {
                StudentId = member.StudentUserId,
                StudentUserId = member.StudentUserId,
                StudentName = member.StudentUser?.User?.FullName ?? "Unknown",
                StudentCode = member.StudentUser?.StudentCode ?? "Unknown",
                Email = Email,
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
            .Include(pi => pi.GithubRepo)
            .Include(pi => pi.JiraProject)
            .Include(pi => pi.Project)
            .FirstOrDefaultAsync(pi => pi.ProjectId == projectId);

        if (integration == null)
        {
            throw new NotFoundException("Integration not found for this Project");
        }

        if (integration.Project.Status != "ACTIVE")
        {
            throw new BusinessException("Cannot sync inactive Projects");
        }

        // Fire and forget background sync
        _ = Task.Run(async () =>
        {
            try
            {
                _logger.LogInformation("[ManualSync] Starting background sync for Project {ProjectId}: {ProjectName}", 
                    projectId, integration.Project.Name);

                if (integration.GithubRepo != null)
                {
                    await _githubClient.SyncCommitsAsync(
                        integration.GithubRepo.Id, 
                        integration.GithubRepo.OwnerLogin, 
                        integration.GithubRepo.Name);
                    
                    await _githubClient.SyncPullRequestsAsync(
                        integration.GithubRepo.Id, 
                        integration.GithubRepo.OwnerLogin, 
                        integration.GithubRepo.Name);
                }

                if (integration.JiraProject != null)
                {
                    await _jiraClient.SyncIssuesAsync(
                        integration.JiraProject.Id, 
                        integration.JiraProject.JiraProjectKey, 
                        integration.JiraProject.JiraUrl ?? "https://atlassian.net");
                }

                _logger.LogInformation("[ManualSync] Successfully completed sync for Project {ProjectId}", projectId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ManualSync] Failed to sync Project {ProjectId}", projectId);
            }
        });

        return new { Message = "Sync triggered. Data will be updated in the background.", projectId };
    }
}
