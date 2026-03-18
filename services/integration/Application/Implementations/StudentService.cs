using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class StudentService : IStudentService
{
    private readonly IUnitOfWork _unitOfWork;

    public StudentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<object> GetStudentStatsAsync(long userId)
    {
        var courseCount = await _unitOfWork.CourseEnrollments.Query().CountAsync(e => e.StudentUserId == userId && e.Status == "ACTIVE");
        var projectCount = await _unitOfWork.TeamMembers.Query().CountAsync(t => t.StudentUserId == userId && t.ParticipationStatus == "ACTIVE");
        
        // Commits this week
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
        var githubUsernames = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.UserId == userId && ea.Provider == "GITHUB")
            .Select(ea => ea.Username ?? ea.ExternalUserKey)
            .ToListAsync();

        var commitsThisWeek = await _unitOfWork.GitHubCommits.Query()
            .CountAsync(c => githubUsernames.Contains(c.AuthorGithubUser.Login) && c.CommittedAt >= sevenDaysAgo);

        // SRS Completed
        var projectIds = await _unitOfWork.TeamMembers.Query()
            .Where(t => t.StudentUserId == userId && t.ParticipationStatus == "ACTIVE")
            .Select(t => t.ProjectId)
            .ToListAsync();
            
        var srsCompleted = await _unitOfWork.ProjectDocuments.Query()
            .CountAsync(d => projectIds.Contains(d.ProjectId) && d.Status == "APPROVED");

        return new
        {
            coursesCount = courseCount,
            projectsCount = projectCount,
            CommitsThisWeek = commitsThisWeek,
            srsCompleted = srsCompleted,
            overallScore = 8.5
        };
    }

    public async Task<PagedResponse<object>> GetStudentCoursesAsync(long userId, PagedRequest request)
    {
        var courses = await _unitOfWork.CourseEnrollments.Query()
            .Include(e => e.Course)
            .Where(e => e.StudentUserId == userId && e.Status == "ACTIVE")
            .Select(e => new
            {
                id = e.Course.Id,
                courseCode = e.Course.CourseCode,
                courseName = e.Course.CourseName,
                Status = e.Course.Status,
                enrolledAt = e.EnrolledAt
            })
            .ToListAsync();

        return new PagedResponse<object>(courses.Cast<object>().ToList(), courses.Count, 1, 100);
    }

    public async Task<PagedResponse<object>> GetStudentProjectsAsync(long userId, PagedRequest request)
    {
        var projects = await _unitOfWork.TeamMembers.Query()
            .Include(t => t.Project).ThenInclude(p => p.Course)
            .Where(t => t.StudentUserId == userId && t.ParticipationStatus == "ACTIVE")
            .Select(t => new
            {
                id = t.Project.Id,
                Name = t.Project.Name,
                courseCode = t.Project.Course.CourseCode,
                Role = t.TeamRole,
                Status = t.Project.Status
            })
            .ToListAsync();

        return new PagedResponse<object>(projects.Cast<object>().ToList(), projects.Count, 1, 100);
    }

    public async Task<PagedResponse<object>> GetStudentCommitsAsync(long userId, PagedRequest request)
    {
        var githubUsernames = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.UserId == userId && ea.Provider == "GITHUB")
            .Select(ea => ea.Username ?? ea.ExternalUserKey)
            .ToListAsync();

        var query = _unitOfWork.GitHubCommits.Query()
            .Where(c => githubUsernames.Contains(c.AuthorGithubUser.Login));

        var totalCount = await query.CountAsync();
        
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 10;

        var commits = await query
            .OrderByDescending(c => c.CommittedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                id = c.CommitSha,
                Message = c.Message,
                createdAt = c.CommittedAt,
                Additions = c.Additions ?? 0,
                Deletions = c.Deletions ?? 0
            })
            .ToListAsync();

        return new PagedResponse<object>(commits.Cast<object>().ToList(), totalCount, page, pageSize);
    }

    public async Task<PagedResponse<object>> GetStudentTasksAsync(long userId, PagedRequest request)
    {
        var jiraAccountIds = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.UserId == userId && ea.Provider == "JIRA")
            .Select(ea => ea.ExternalUserKey)
            .ToListAsync();

        var query = _unitOfWork.JiraIssues.Query()
            .Where(i => jiraAccountIds.Contains(i.AssigneeJiraAccountId));

        var totalCount = await query.CountAsync();
        
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 10;

        var tasks = await query
            .OrderByDescending(i => i.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new
            {
                id = i.JiraIssueKey,
                Title = i.Title,
                Status = i.Status,
                Type = i.IssueType,
                Priority = i.Priority
            })
            .ToListAsync();

        return new PagedResponse<object>(tasks.Cast<object>().ToList(), totalCount, page, pageSize);
    }

    public async Task<PagedResponse<object>> GetStudentGradesAsync(long userId, PagedRequest request)
    {
        var activeProjects = await _unitOfWork.TeamMembers.Query()
            .Include(t => t.Project).ThenInclude(p => p.Course)
            .Where(t => t.StudentUserId == userId && t.ParticipationStatus == "ACTIVE")
            .Select(t => t.ProjectId)
            .ToListAsync();

        var query = _unitOfWork.ProjectDocuments.Query()
            .Include(pd => pd.Project).ThenInclude(p => p.Course)
            .Where(pd => activeProjects.Contains(pd.ProjectId) && pd.Status == "FINAL");

        var totalCount = await query.CountAsync();
        
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 10;

        var grades = await query
            .OrderByDescending(pd => pd.ReviewedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(pd => new
            {
                courseName = pd.Project.Course.CourseName,
                srsVersion = pd.VersionNo,
                score = pd.Score,
                Feedback = pd.Feedback
            })
            .ToListAsync();

        return new PagedResponse<object>(grades.Cast<object>().ToList(), totalCount, page, pageSize);
    }

    public async Task<List<object>> GetStudentWarningsAsync(long userId)
    {
        var warnings = new List<object>();

        // Check for no commits in the last 7 days
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
        var githubUsernames = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.UserId == userId && ea.Provider == "GITHUB")
            .Select(ea => ea.Username ?? ea.ExternalUserKey)
            .ToListAsync();

        var hasRecentCommits = await _unitOfWork.GitHubCommits.Query()
            .AnyAsync(c => githubUsernames.Contains(c.AuthorGithubUser.Login) && c.CommittedAt >= sevenDaysAgo);

        if (githubUsernames.Any() && !hasRecentCommits)
        {
            var activeCourses = await _unitOfWork.CourseEnrollments.Query()
                .Include(ce => ce.Course)
                .Where(ce => ce.StudentUserId == userId && ce.Status == "ACTIVE")
                .Select(ce => ce.Course.CourseCode)
                .ToListAsync();

            if (activeCourses.Any())
            {
                 warnings.Add(new { Message = "Báº¡n chÆ°a cĂ³ commit nĂ o trĂªn Github trong 7 ngĂ y qua.", severity = "HIGH", courseCode = string.Join(", ", activeCourses) });
            }
        }

        return warnings;
    }

    public async Task<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.HeatmapStat>> GetStudentHeatmapAsync(long userId, int days = 35)
    {
        var since = DateTime.UtcNow.AddDays(-days).Date;
        var githubUsernames = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.UserId == userId && ea.Provider == "GITHUB")
            .Select(ea => ea.Username ?? ea.ExternalUserKey)
            .ToListAsync();

        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => githubUsernames.Contains(c.AuthorGithubUser.Login) && c.CommittedAt >= since)
            .Select(c => new { c.CommittedAt })
            .ToListAsync();

        return commits
            .Where(c => c.CommittedAt.HasValue)
            .GroupBy(c => c.CommittedAt!.Value.Date)
            .Select(g => new JiraGithubExport.Shared.Contracts.Responses.Analytics.HeatmapStat 
            { 
                Date = g.Key.ToString("yyyy-MM-dd"), 
                Count = g.Count() 
            })
            .OrderBy(h => h.Date)
            .ToList();
    }

    public async Task<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.DailyCommitStat>> GetStudentCommitActivityAsync(long userId, int days = 7)
    {
        var since = DateTime.UtcNow.AddDays(-days).Date;
        var githubUsernames = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.UserId == userId && ea.Provider == "GITHUB")
            .Select(ea => ea.Username ?? ea.ExternalUserKey)
            .ToListAsync();

        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => githubUsernames.Contains(c.AuthorGithubUser.Login) && c.CommittedAt >= since)
            .Select(c => new { c.CommittedAt })
            .ToListAsync();

        var allDays = Enumerable.Range(0, days)
            .Select(i => DateTime.UtcNow.AddDays(-days + i + 1).Date)
            .ToList();

        return allDays.Select(d => new JiraGithubExport.Shared.Contracts.Responses.Analytics.DailyCommitStat
        {
            Day = d.ToString("ddd"),
            Commits = commits.Count(c => c.CommittedAt.HasValue && c.CommittedAt.Value.Date == d)
        }).ToList();
    }

    public async Task<JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentDashboardStatsResponse> GetStudentDashboardStatsAsync(long studentUserId)
    {
        var teamMemberships = await _unitOfWork.TeamMembers.Query()
            .AsNoTracking()
            .Include(tm => tm.Project)
                .ThenInclude(p => p.Course)
            .Include(tm => tm.Project)
                .ThenInclude(p => p.ProjectIntegration)
            .Where(tm => tm.StudentUserId == studentUserId && tm.ParticipationStatus == "ACTIVE")
            .ToListAsync();

        var response = new JiraGithubExport.Shared.Contracts.Responses.Analytics.StudentDashboardStatsResponse
        {
            TotalProjects = teamMemberships.Count
        };

        if (!teamMemberships.Any()) return response;

        var repoMap = new Dictionary<long, long>();
        foreach (var tm in teamMemberships)
        {
            if (tm.Project?.ProjectIntegration.GithubRepoId != null)
                repoMap[tm.Project.Id] = tm.Project.ProjectIntegration.GithubRepoId.Value;
        }

        var allRepoIds = repoMap.Values.Distinct().ToList();
        var commitsByRepo = new Dictionary<long, int>();
        int totalStudentCommits = 0;
        int totalTeamCommits = 0;
        int totalPRs = 0;

        if (allRepoIds.Any())
        {
            var repoCommits = await _unitOfWork.GitHubCommits.Query()
                .AsNoTracking()
                .Where(c => allRepoIds.Contains(c.RepoId))
                .GroupBy(c => c.RepoId)
                .Select(g => new { RepoId = g.Key, Count = g.Count() })
                .ToListAsync();

            foreach (var rc in repoCommits)
                commitsByRepo[rc.RepoId] = rc.Count;

            totalTeamCommits = repoCommits.Sum(r => r.Count);

            var studentUser = await _unitOfWork.Users.GetByIdAsync(studentUserId);
            if (studentUser != null)
            {
                var studentGithubUsers = await _unitOfWork.GitHubUsers.Query()
                    .AsNoTracking()
                    .Where(gu => gu.Email != null && gu.Email == studentUser.Email)
                    .Select(gu => gu.Id)
                    .ToListAsync();

                if (studentGithubUsers.Any())
                {
                    totalStudentCommits = await _unitOfWork.GitHubCommits.Query()
                        .AsNoTracking()
                        .Where(c => allRepoIds.Contains(c.RepoId) && c.AuthorGithubUserId.HasValue && studentGithubUsers.Contains(c.AuthorGithubUserId.Value))
                        .CountAsync();
                }
            }

            totalPRs = await _unitOfWork.GitHubPullRequests.Query()
                .AsNoTracking()
                .Where(pr => allRepoIds.Contains(pr.RepoId))
                .CountAsync();
        }

        response.TotalCommits = totalStudentCommits;
        response.TotalPullRequests = totalPRs;
        response.ContributionPercent = totalTeamCommits > 0 ? Math.Round((double)totalStudentCommits * 100 / totalTeamCommits, 1) : 0;

        int weeklyCommits = 0;
        if (allRepoIds.Any())
        {
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            weeklyCommits = await _unitOfWork.GitHubCommits.Query()
                .AsNoTracking()
                .Where(c => allRepoIds.Contains(c.RepoId) && c.CommittedAt >= sevenDaysAgo)
                .CountAsync();
        }

        var jiraProjectIds = teamMemberships
            .Where(tm => tm.Project?.ProjectIntegration != null && tm.Project.ProjectIntegration.JiraProjectId.HasValue)
            .Select(tm => tm.Project!.ProjectIntegration!.JiraProjectId!.Value)
            .Distinct()
            .ToList();

        if (jiraProjectIds.Any())
        {
            response.JiraTasksAssigned = await _unitOfWork.JiraIssues.Query()
                .AsNoTracking()
                .Where(i => jiraProjectIds.Contains(i.JiraProjectId))
                .CountAsync();
            response.JiraTasksDone = await _unitOfWork.JiraIssues.Query()
                .AsNoTracking()
                .Where(i => jiraProjectIds.Contains(i.JiraProjectId) && i.Status != null && i.Status.ToUpper() == "DONE")
                .CountAsync();
        }

        response.WeeklyCommits = weeklyCommits;
        response.TotalPrs = totalPRs;
        response.TotalIssues = response.JiraTasksAssigned;

        foreach (var tm in teamMemberships)
        {
            var proj = tm.Project;
            if (proj == null) continue;

            int projCommits = 0;
            if (repoMap.TryGetValue(proj.Id, out var rId) && commitsByRepo.TryGetValue(rId, out var cnt))
                projCommits = cnt;

            int openIssues = 0;
            int issuesDone = 0;
            int completionPct = 0;
            if (proj.ProjectIntegration?.JiraProjectId != null)
            {
                var jpId = proj.ProjectIntegration.JiraProjectId.Value;
                var totalIss = await _unitOfWork.JiraIssues.Query().CountAsync(i => i.JiraProjectId == jpId);
                issuesDone = await _unitOfWork.JiraIssues.Query().CountAsync(i => i.JiraProjectId == jpId && i.Status != null && i.Status.ToUpper() == "DONE");
                openIssues = totalIss - issuesDone;
                completionPct = totalIss > 0 ? (int)Math.Round((double)issuesDone * 100 / totalIss) : 0;
            }

            response.Projects.Add(new StudentProjectInfo
            {
                ProjectId = proj.Id,
                ProjectName = proj.Name ?? "Unknown",
                CourseName = proj.Course?.CourseName ?? "N/A",
                CourseCode = proj.Course?.CourseCode ?? "",
                Role = tm.TeamRole ?? "MEMBER",
                CommitCount = projCommits,
                Commits = projCommits,
                IssuesDone = issuesDone,
                OpenIssues = openIssues,
                CompletionPercent = completionPct,
                LastCommit = proj.UpdatedAt == default ? null : (int)(DateTime.UtcNow - proj.UpdatedAt).TotalDays + " ngĂ y trÆ°á»›c"
            });
        }

        return response;
    }

    public async Task<List<object>> GetStudentDeadlinesAsync(long userId)
    {
        var projectIds = await _unitOfWork.TeamMembers.Query()
            .Where(t => t.StudentUserId == userId && t.ParticipationStatus == "ACTIVE")
            .Select(t => t.ProjectId)
            .ToListAsync();

        var deadlines = new List<object>();

        foreach (var projectId in projectIds)
        {
            var Project = await _unitOfWork.Projects.Query()
                .Include(p => p.ProjectIntegration)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (Project?.ProjectIntegration.JiraProjectId != null)
            {
                var issues = await _unitOfWork.JiraIssues.Query()
                    .Where(i => i.JiraProjectId == Project.ProjectIntegration.JiraProjectId && i.Status != "Done")
                    .OrderBy(i => i.UpdatedAt)
                    .Take(5)
                    .ToListAsync();

                foreach (var issue in issues)
                {
                    deadlines.Add(new
                    {
                        id = issue.JiraIssueKey,
                        Title = issue.Title,
                        deadline = issue.UpdatedAt.AddDays(7).ToString("yyyy-MM-dd"), // Mocking for now as per ProjectDashboardService
                        Status = issue.Status,
                        Project = Project.Name
                    });
                }
            }
        }

        return deadlines.OrderBy(d => ((dynamic)d).deadline).ToList();
    }
}
