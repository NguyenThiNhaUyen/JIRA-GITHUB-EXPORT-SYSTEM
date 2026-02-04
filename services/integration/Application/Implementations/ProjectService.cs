using AutoMapper;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using JiraGithubExport.Shared.Infrastructure.ExternalServices.Interfaces;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ProjectService : IProjectService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<ProjectService> _logger;
    private readonly IGitHubClient _githubClient;
    private readonly IJiraClient _jiraClient;

    public ProjectService(
        IUnitOfWork unitOfWork, 
        IMapper mapper, 
        ILogger<ProjectService> logger,
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
        // Validate course exists
        var course = await _unitOfWork.Courses.FirstOrDefaultAsync(c => c.id == courseId);
        if (course == null)
        {
            _logger.LogWarning("Course not found: {CourseId}", courseId);
            throw new NotFoundException("Course not found");
        }

        // Check duplicate project name in course
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
        if (project == null)
        {
            throw new NotFoundException("Project not found");
        }

        return _mapper.Map<ProjectDetailResponse>(project);
    }

    public async Task<List<ProjectDetailResponse>> GetProjectsByCourseAsync(long courseId)
    {
        var projects = await _unitOfWork.Projects.FindAsync(p => p.course_id == courseId && p.status == "ACTIVE");
        return _mapper.Map<List<ProjectDetailResponse>>(projects.ToList());
    }

    public async Task AddTeamMemberAsync(long projectId, AddTeamMemberRequest request)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null)
        {
            _logger.LogWarning("Project not found: {ProjectId}", projectId);
            throw new NotFoundException("Project not found");
        }

        var student = await _unitOfWork.Students.FirstOrDefaultAsync(s => s.user_id == request.StudentUserId);
        if (student == null)
        {
            _logger.LogWarning("Student not found: {StudentUserId}", request.StudentUserId);
            throw new NotFoundException("Student not found");
        }

        // Check if student is enrolled in the course
        var enrollment = await _unitOfWork.CourseEnrollments.FirstOrDefaultAsync(e =>
            e.course_id == project.course_id && e.student_user_id == request.StudentUserId && e.status == "ACTIVE");

        if (enrollment == null)
        {
            throw new BusinessException("Student is not enrolled in this course");
        }

        // Check if already a team member
        var existingMember = await _unitOfWork.TeamMembers.FirstOrDefaultAsync(tm =>
            tm.project_id == projectId && tm.student_user_id == request.StudentUserId && tm.participation_status == "ACTIVE");

        if (existingMember != null)
        {
            throw new BusinessException("Student is already a team member");
        }

        // Simple validation: Check if student is already in another project in this course
        var activeProjectsInCourse = await _unitOfWork.TeamMembers.FindAsync(tm =>
            tm.student_user_id == request.StudentUserId &&
            tm.participation_status == "ACTIVE" &&
            tm.project.course_id == project.course_id);

        if (activeProjectsInCourse.Any())
        {
            throw new BusinessException("Student is already in another project in this course");
        }

        var teamMember = new team_member
        {
            project_id = projectId,
            student_user_id = request.StudentUserId,
            team_role = request.TeamRole,
            responsibility = request.Responsibility,
            participation_status = "ACTIVE",
            joined_at = DateTime.UtcNow
        };

        _unitOfWork.TeamMembers.Add(teamMember);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RemoveTeamMemberAsync(long projectId, long studentUserId)
    {
        var teamMember = await _unitOfWork.TeamMembers.FirstOrDefaultAsync(tm =>
            tm.project_id == projectId && tm.student_user_id == studentUserId && tm.participation_status == "ACTIVE");

        if (teamMember == null)
        {
            throw new NotFoundException("Team member not found");
        }

        // Soft delete - keep history
        teamMember.participation_status = "LEFT";
        teamMember.left_at = DateTime.UtcNow;

        _unitOfWork.TeamMembers.Update(teamMember);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Student {StudentId} removed from project {ProjectId}", studentUserId, projectId);
    }

    public async Task LinkIntegrationAsync(long projectId, LinkIntegrationRequest request)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null)
        {
            _logger.LogWarning("Project not found: {ProjectId}", projectId);
            throw new NotFoundException("Project not found");
        }

        // Check if integration already exists
        var existingIntegration = await _unitOfWork.ProjectIntegrations.FirstOrDefaultAsync(pi => pi.project_id == projectId);

        if (existingIntegration != null)
        {
            // Update existing integration
            if (!string.IsNullOrEmpty(request.GithubRepoUrl))
            {
                // Parse GitHub URL
                var (owner, repoName) = ParseGitHubUrl(request.GithubRepoUrl);

                // Find or create GitHub repository
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
                // Find or create Jira project
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
            // Create new integration
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

        // Trigger initial sync
        var syncIntegration = await _unitOfWork.ProjectIntegrations.Query()
            .Include(pi => pi.github_repo)
            .Include(pi => pi.jira_project)
            .FirstOrDefaultAsync(pi => pi.project_id == projectId);

        if (syncIntegration != null)
        {
            if (syncIntegration.github_repo != null)
            {
                await _githubClient.SyncCommitsAsync(syncIntegration.github_repo.id, syncIntegration.github_repo.owner_login, syncIntegration.github_repo.name);
                await _githubClient.SyncPullRequestsAsync(syncIntegration.github_repo.id, syncIntegration.github_repo.owner_login, syncIntegration.github_repo.name);
            }

            if (syncIntegration.jira_project != null)
            {
                await _jiraClient.SyncIssuesAsync(syncIntegration.jira_project.id, syncIntegration.jira_project.jira_project_key, syncIntegration.jira_project.jira_url);
            }
        }
    }

    public async Task<ProjectDashboardResponse> GetProjectDashboardAsync(long projectId)
    {
        var project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.id == projectId);
        if (project == null)
        {
            throw new NotFoundException("Project not found");
        }

        var activeMembers = project.team_members.Where(tm => tm.participation_status == "ACTIVE").ToList();
        var leader = activeMembers.FirstOrDefault(tm => tm.team_role == "LEADER");

        var dashboard = new ProjectDashboardResponse
        {
            Project = new ProjectSummary
            {
                Id = project.id,
                Name = project.name,
                Status = project.status
            },
            TeamSummary = new TeamSummary
            {
                TotalMembers = activeMembers.Count,
                ActiveMembers = activeMembers.Count,
                Leader = leader != null ? $"{leader.student_user.user.full_name} ({leader.student_user.student_code})" : null
            }
        };

        // GitHub stats (if integrated)
        if (project.project_integration?.github_repo_id != null)
        {
            var commits = await _unitOfWork.GitHubCommits.FindAsync(gc =>
                gc.repo_id == project.project_integration.github_repo_id);

            var prs = await _unitOfWork.GitHubPullRequests.FindAsync(pr =>
                pr.repo_id == project.project_integration.github_repo_id);

            var commitsList = commits.ToList();
            var prsList = prs.ToList();
            DateTime? lastCommitDate = commitsList.Any() ? commitsList.Max(c => c.committed_at) : (DateTime?)null;
            
            dashboard.GitHubStats = new GitHubStats
            {
                TotalCommits = commitsList.Count,
                TotalPullRequests = prsList.Count,
                LastCommitDate = lastCommitDate,
                InactiveDays = lastCommitDate.HasValue ?
                    (int)(DateTime.UtcNow - lastCommitDate.Value).TotalDays : 0
            };
        }

        // Jira stats (if integrated)
        if (project.project_integration?.jira_project_id != null)
        {
            var issues = await _unitOfWork.JiraIssues.FindAsync(ji =>
                ji.jira_project_id == project.project_integration.jira_project_id);

            var issuesList = issues.ToList();
            dashboard.JiraStats = new JiraStats
            {
                TotalIssues = issuesList.Count,
                InProgress = issuesList.Count(i => i.status == "In Progress"),
                Done = issuesList.Count(i => i.status == "Done"),
                LastUpdate = issuesList.Any() ? issuesList.Max(i => i.updated_at) : null
            };
        }

        // Member contributions (last 30 days)
        var thirtyDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        dashboard.MemberContributions = new List<MemberContribution>();

        foreach (var member in activeMembers)
        {
            var activities = await _unitOfWork.StudentActivityDailies.FindAsync(sad =>
                sad.student_user_id == member.student_user_id &&
                sad.project_id == projectId &&
                sad.activity_date >= thirtyDaysAgo);

            var activityList = activities.ToList();
            DateOnly? lastActivity = activityList.Any() ? activityList.Max(a => a.activity_date) : (DateOnly?)null;

            dashboard.MemberContributions.Add(new MemberContribution
            {
                StudentCode = member.student_user.student_code,
                FullName = member.student_user.user.full_name ?? "",
                Commits30d = activityList.Sum(a => a.commits_count),
                PullRequests30d = activityList.Sum(a => a.pull_requests_count),
                JiraIssuesCompleted30d = activityList.Sum(a => a.issues_completed),
                LastActivityDate = lastActivity.HasValue ? lastActivity.Value.ToDateTime(TimeOnly.MinValue) : null,
                InactiveDays = lastActivity.HasValue ? (int)(DateTime.UtcNow.Date - lastActivity.Value.ToDateTime(TimeOnly.MinValue).Date).TotalDays : 999,
                Alert = lastActivity.HasValue && (DateTime.UtcNow.Date - lastActivity.Value.ToDateTime(TimeOnly.MinValue).Date).TotalDays > 14 ?
                    $"⚠️ Inactive for {(int)(DateTime.UtcNow.Date - lastActivity.Value.ToDateTime(TimeOnly.MinValue).Date).TotalDays} days" : null
            });
        }

        return dashboard;
    }

    private (string owner, string repoName) ParseGitHubUrl(string url)
    {
        // Parse URLs like: https://github.com/owner/repo or github.com/owner/repo
        var uri = new Uri(url.StartsWith("http") ? url : "https://" + url);
        var segments = uri.AbsolutePath.Trim('/').Split('/');

        if (segments.Length < 2)
        {
            throw new ValidationException("Invalid GitHub repository URL");
        }

        return (segments[0], segments[1].Replace(".git", ""));
    }
}








