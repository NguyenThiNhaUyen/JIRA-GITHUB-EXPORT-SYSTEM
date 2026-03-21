using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

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
        var courseCount = await _unitOfWork.CourseEnrollments.Query().CountAsync(e => e.student_user_id == userId && e.status == "ACTIVE");
        var projectCount = await _unitOfWork.TeamMembers.Query().CountAsync(t => t.student_user_id == userId && t.participation_status == "ACTIVE");
        
        // Commits this week
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
        var githubUsernames = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.user_id == userId && ea.provider == "GITHUB")
            .Select(ea => ea.username ?? ea.external_user_key)
            .ToListAsync();

        var commitsThisWeek = await _unitOfWork.GitHubCommits.Query()
            .CountAsync(c => githubUsernames.Contains(c.author_github_user.login) && c.committed_at >= sevenDaysAgo);

        // SRS Completed
        var projectIds = await _unitOfWork.TeamMembers.Query()
            .Where(t => t.student_user_id == userId && t.participation_status == "ACTIVE")
            .Select(t => t.project_id)
            .ToListAsync();
            
        var srsCompleted = await _unitOfWork.ProjectDocuments.Query()
            .CountAsync(d => projectIds.Contains(d.project_id) && d.status == "APPROVED");

        return new
        {
            coursesCount = courseCount,
            projectsCount = projectCount,
            commitsThisWeek = commitsThisWeek,
            srsCompleted = srsCompleted,
            overallScore = 8.5
        };
    }

    public async Task<PagedResponse<object>> GetStudentCoursesAsync(long userId, PagedRequest request)
    {
        var courses = await _unitOfWork.CourseEnrollments.Query()
            .Include(e => e.course)
                .ThenInclude(c => c.subject)
            .Include(e => e.course)
                .ThenInclude(c => c.lecturer_users)
            .Where(e => e.student_user_id == userId && e.status == "ACTIVE")
            .Select(e => new
            {
                id = e.course.id,
                code = e.course.course_code,
                name = e.course.course_name,
                status = e.course.status,
                enrolledAt = e.enrolled_at,
                subject = e.course.subject != null ? new { code = e.course.subject.subject_code, name = e.course.subject.subject_name } : null,
                lecturers = e.course.lecturer_users.Select(l => new { id = l.user_id, name = l.office_email }).ToList()
            })
            .ToListAsync();

        return new PagedResponse<object>(courses.Cast<object>().ToList(), courses.Count, 1, 100);
    }

    public async Task<PagedResponse<object>> GetStudentProjectsAsync(long userId, PagedRequest request)
    {
        var projects = await _unitOfWork.TeamMembers.Query()
            .AsNoTracking()
            .Include(t => t.project).ThenInclude(p => p.course)
            .Include(t => t.project).ThenInclude(p => p.project_integration)
            .Include(t => t.project).ThenInclude(p => p.team_members)
            .Where(t => t.student_user_id == userId && t.participation_status == "ACTIVE")
            .Select(t => new
            {
                id = t.project.id,
                name = t.project.name,
                courseId = t.project.course_id,
                courseCode = t.project.course.course_code,
                role = t.team_role,
                status = t.project.status,
                topic = t.project.description,
                integration = t.project.project_integration != null ? new {
                     githubUrl = t.project.project_integration.github_repo.repo_url,
                     jiraUrl = t.project.project_integration.jira_project.jira_url,
                     githubStatus = t.project.project_integration.approval_status,
                     jiraStatus = t.project.project_integration.approval_status
                } : null,
                team = t.project.team_members.Select(tm => new { studentId = tm.student_user_id, role = tm.team_role }).ToList()
            })
            .ToListAsync();

        return new PagedResponse<object>(projects.Cast<object>().ToList(), projects.Count, 1, 100);
    }

    public async Task<PagedResponse<object>> GetStudentCommitsAsync(long userId, PagedRequest request)
    {
        var githubUsernames = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.user_id == userId && ea.provider == "GITHUB")
            .Select(ea => ea.username ?? ea.external_user_key)
            .ToListAsync();

        var query = _unitOfWork.GitHubCommits.Query()
            .Where(c => githubUsernames.Contains(c.author_github_user.login));

        var totalCount = await query.CountAsync();
        
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 10;

        var commits = await query
            .OrderByDescending(c => c.committed_at)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                id = c.commit_sha,
                message = c.message,
                createdAt = c.committed_at,
                additions = c.additions ?? 0,
                deletions = c.deletions ?? 0
            })
            .ToListAsync();

        return new PagedResponse<object>(commits.Cast<object>().ToList(), totalCount, page, pageSize);
    }

    public async Task<PagedResponse<object>> GetStudentTasksAsync(long userId, PagedRequest request)
    {
        var jiraAccountIds = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.user_id == userId && ea.provider == "JIRA")
            .Select(ea => ea.external_user_key)
            .ToListAsync();

        var query = _unitOfWork.JiraIssues.Query()
            .Where(i => jiraAccountIds.Contains(i.assignee_jira_account_id));

        var totalCount = await query.CountAsync();
        
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 10;

        var tasks = await query
            .OrderByDescending(i => i.updated_at)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new
            {
                id = i.jira_issue_key,
                title = i.title,
                status = i.status,
                type = i.issue_type,
                priority = i.priority
            })
            .ToListAsync();

        return new PagedResponse<object>(tasks.Cast<object>().ToList(), totalCount, page, pageSize);
    }

    public async Task<PagedResponse<object>> GetStudentGradesAsync(long userId, PagedRequest request)
    {
        var activeProjects = await _unitOfWork.TeamMembers.Query()
            .Include(t => t.project).ThenInclude(p => p.course)
            .Where(t => t.student_user_id == userId && t.participation_status == "ACTIVE")
            .Select(t => t.project_id)
            .ToListAsync();

        var query = _unitOfWork.ProjectDocuments.Query()
            .Include(pd => pd.project).ThenInclude(p => p.course)
            .Where(pd => activeProjects.Contains(pd.project_id) && pd.status == "FINAL");

        var totalCount = await query.CountAsync();
        
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 10;

        var grades = await query
            .OrderByDescending(pd => pd.reviewed_at)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(pd => new
            {
                courseName = pd.project.course.course_name,
                srsVersion = pd.version_no,
                score = pd.score ?? 0,
                feedback = pd.feedback
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
            .Where(ea => ea.user_id == userId && ea.provider == "GITHUB")
            .Select(ea => ea.username ?? ea.external_user_key)
            .ToListAsync();

        var hasRecentCommits = await _unitOfWork.GitHubCommits.Query()
            .AnyAsync(c => githubUsernames.Contains(c.author_github_user.login) && c.committed_at >= sevenDaysAgo);

        if (githubUsernames.Any() && !hasRecentCommits)
        {
            var activeCourses = await _unitOfWork.CourseEnrollments.Query()
                .Include(ce => ce.course)
                .Where(ce => ce.student_user_id == userId && ce.status == "ACTIVE")
                .Select(ce => ce.course.course_code)
                .ToListAsync();

            if (activeCourses.Any())
            {
                 warnings.Add(new { message = "Bạn chưa có commit nào trên Github trong 7 ngày qua.", severity = "HIGH", courseCode = string.Join(", ", activeCourses) });
            }
        }

        return warnings;
    }

    public async Task<List<JiraGithubExport.Shared.Contracts.Responses.Analytics.HeatmapStat>> GetStudentHeatmapAsync(long userId, int days = 35)
    {
        var since = DateTime.UtcNow.AddDays(-days).Date;
        var githubUsernames = await _unitOfWork.ExternalAccounts.Query()
            .Where(ea => ea.user_id == userId && ea.provider == "GITHUB")
            .Select(ea => ea.username ?? ea.external_user_key)
            .ToListAsync();

        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => githubUsernames.Contains(c.author_github_user.login) && c.committed_at >= since)
            .Select(c => new { c.committed_at })
            .ToListAsync();

        return commits
            .Where(c => c.committed_at.HasValue)
            .GroupBy(c => c.committed_at!.Value.Date)
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
            .Where(ea => ea.user_id == userId && ea.provider == "GITHUB")
            .Select(ea => ea.username ?? ea.external_user_key)
            .ToListAsync();

        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => githubUsernames.Contains(c.author_github_user.login) && c.committed_at >= since)
            .Select(c => new { c.committed_at })
            .ToListAsync();

        var allDays = Enumerable.Range(0, days)
            .Select(i => DateTime.UtcNow.AddDays(-days + i + 1).Date)
            .ToList();

        return allDays.Select(d => new JiraGithubExport.Shared.Contracts.Responses.Analytics.DailyCommitStat
        {
            Day = d.ToString("ddd"),
            Commits = commits.Count(c => c.committed_at.HasValue && c.committed_at.Value.Date == d)
        }).ToList();
    }

    public async Task<List<object>> GetStudentDeadlinesAsync(long userId)
    {
        var projectIds = await _unitOfWork.TeamMembers.Query()
            .Where(t => t.student_user_id == userId && t.participation_status == "ACTIVE")
            .Select(t => t.project_id)
            .ToListAsync();

        var deadlines = new List<object>();

        foreach (var projectId in projectIds)
        {
            var project = await _unitOfWork.Projects.Query()
                .Include(p => p.project_integration)
                .FirstOrDefaultAsync(p => p.id == projectId);

            if (project?.project_integration?.jira_project_id != null)
            {
                var issues = await _unitOfWork.JiraIssues.Query()
                    .Where(i => i.jira_project_id == project.project_integration.jira_project_id && i.status != "Done")
                    .OrderBy(i => i.updated_at)
                    .Take(5)
                    .ToListAsync();

                foreach (var issue in issues)
                {
                    deadlines.Add(new
                    {
                        id = issue.jira_issue_key,
                        title = issue.title,
                        deadline = issue.updated_at.AddDays(7).ToString("yyyy-MM-dd"), // Mocking for now as per ProjectDashboardService
                        status = issue.status,
                        project = project.name
                    });
                }
            }
        }

        return deadlines.OrderBy(d => ((dynamic)d).deadline).ToList();
    }
}
