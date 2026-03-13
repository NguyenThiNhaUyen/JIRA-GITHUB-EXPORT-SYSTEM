using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class AnalyticsService : IAnalyticsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AnalyticsService> _logger;
    private readonly Microsoft.AspNetCore.SignalR.IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> _hubContext;

    public AnalyticsService(
        IUnitOfWork unitOfWork, 
        ILogger<AnalyticsService> logger,
        Microsoft.AspNetCore.SignalR.IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> hubContext)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _hubContext = hubContext;
    }

    public async Task<IntegrationStatsResponse> GetIntegrationStatsAsync()
    {
        var totalProjectsTask = _unitOfWork.Projects.Query().CountAsync();
        
        var integrations = await _unitOfWork.ProjectIntegrations.Query().AsNoTracking().ToListAsync();

        int repoConnected = integrations.Count(i => i.github_repo_id.HasValue);
        int jiraConnected = integrations.Count(i => i.jira_project_id.HasValue);

        int totalProjects = await totalProjectsTask;
        int repoMissing = totalProjects - repoConnected;

        // Dummy/Placeholder for SyncErrors and ReportsExported
        int syncErrors = 0; 
        int reportsExported = await _unitOfWork.ReportExports.Query().CountAsync();

        return new IntegrationStatsResponse
        {
            RepoConnected = repoConnected,
            RepoMissing = repoMissing < 0 ? 0 : repoMissing,
            JiraConnected = jiraConnected,
            SyncErrors = syncErrors,
            ReportsExported = reportsExported
        };
    }

    public async Task<ActivityChartResponse> GetActivityChartAsync()
    {
        var ninetyDaysAgo = DateTime.UtcNow.AddDays(-90);
        
        // Fetch commits from last 90 days for Heatmap
        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => c.committed_at >= ninetyDaysAgo)
            .Select(c => new { c.committed_at })
            .ToListAsync();

        // 1. Heatmap (90 days)
        var heatmapData = commits
            .Where(c => c.committed_at.HasValue)
            .GroupBy(c => c.committed_at!.Value.Date)
            .Select(g => new HeatmapStat
            {
                Date = g.Key.ToString("yyyy-MM-dd"),
                Count = g.Count()
            })
            .OrderBy(h => h.Date)
            .ToList();

        // 2. Commit Chart (Last 7 days logic converted to short day names Mon, Tue)
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7).Date;
        var recentCommits = commits.Where(c => c.committed_at.HasValue && c.committed_at.Value.Date >= sevenDaysAgo).ToList();
        
        var chartData = recentCommits
            .GroupBy(c => c.committed_at!.Value.Date.DayOfWeek)
            .Select(g => new DailyCommitStat
            {
                Day = g.Key.ToString().Substring(0, 3), // Mon, Tue...
                Commits = g.Count()
            })
            .ToList();

        // Ensure all 7 days are represented even if 0 commits
        var allDays = new List<string> { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
        var completeChartData = allDays.Select(day => new DailyCommitStat
        {
            Day = day,
            Commits = chartData.FirstOrDefault(c => c.Day == day)?.Commits ?? 0
        }).ToList();

        return new ActivityChartResponse
        {
            CommitChart = completeChartData,
            ContributionHeatmap = heatmapData
        };
    }

    public async Task<TeamAnalyticsResponse> GetTeamAnalyticsAsync()
    {
        // Get active projects with some navigation properties
        var projects = await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Include(p => p.project_integration)
            .Select(p => new 
            {
                p.id,
                ProjectName = p.name,
                p.created_at,
                HasRepo = p.project_integration != null && p.project_integration.github_repo_id.HasValue,
                HasJira = p.project_integration != null && p.project_integration.jira_project_id.HasValue,
                RepoId = p.project_integration != null ? p.project_integration.github_repo_id : null
            })
            .ToListAsync();

        // Fetch commit counts per repo to calculate top active teams
        var repoIds = projects.Where(p => p.HasRepo && p.RepoId.HasValue).Select(p => p.RepoId!.Value).ToList();
        
        // Group commits by repo_id
        var repoCommitCounts = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => repoIds.Contains(c.repo_id))
            .GroupBy(c => c.repo_id)
            .Select(g => new { RepoId = g.Key, Count = g.Count(), LastCommit = g.Max(x => x.committed_at) })
            .ToDictionaryAsync(x => x.RepoId);

        var detailedActivity = projects.Select(p => new DetailedTeamActivityStat
        {
            Team = p.ProjectName,
            RepoStatus = p.HasRepo,
            TotalCommits = p.RepoId.HasValue && repoCommitCounts.ContainsKey(p.RepoId.Value) 
                ? repoCommitCounts[p.RepoId.Value].Count : 0,
            LastCommitTime = p.RepoId.HasValue && repoCommitCounts.ContainsKey(p.RepoId.Value) 
                ? repoCommitCounts[p.RepoId.Value].LastCommit : null,
            Status = p.HasRepo ? "ACTIVE" : "MISSING_REPO"
        }).ToList();

        // Mark teams as LOW if repo is connected but 0 commits or last commit was > 14 days ago
        var fourteenDaysAgo = DateTime.UtcNow.AddDays(-14);
        foreach(var stat in detailedActivity.Where(d => d.RepoStatus))
        {
            if (stat.TotalCommits == 0 || (stat.LastCommitTime.HasValue && stat.LastCommitTime.Value < fourteenDaysAgo))
            {
                stat.Status = "LOW";
            }
        }

        // Top Ranking (by Commits)
        var topRanking = detailedActivity
            .Where(d => d.TotalCommits > 0)
            .OrderByDescending(d => d.TotalCommits)
            .Take(5)
            .Select(d => new TeamRankingStat { Team = d.Team, Commits = d.TotalCommits })
            .ToList();

        // Inactive Warning Logic
        var inactiveWarning = new List<TeamWarningStat>();
        foreach (var p in projects)
        {
            if (!p.HasRepo)
            {
                inactiveWarning.Add(new TeamWarningStat { Team = p.ProjectName, Reason = "Repository is empty or missing" });
            }
            else if (!p.HasJira)
            {
                inactiveWarning.Add(new TeamWarningStat { Team = p.ProjectName, Reason = "No Jira connected since creation" });
            }
            else
            {
                var stat = detailedActivity.FirstOrDefault(d => d.Team == p.ProjectName);
                if (stat != null && stat.Status == "LOW")
                {
                    inactiveWarning.Add(new TeamWarningStat { Team = p.ProjectName, Reason = "No commits in the last 14 days" });
                }
            }
        }

        return new TeamAnalyticsResponse
        {
            TopRanking = topRanking,
            InactiveWarning = inactiveWarning.Take(10).ToList(),
            DetailedActivity = detailedActivity.OrderByDescending(d => d.TotalCommits).ToList()
        };
    }

    public async Task<List<AuditLogResponse>> GetRecentAuditLogsAsync(int count = 10)
    {
        var logs = await _unitOfWork.AuditLogs.Query()
            .AsNoTracking()
            .OrderByDescending(a => a.timestamp)
            .Take(count)
            .ToListAsync();

        return logs.Select(l => new AuditLogResponse
        {
            Type = l.action,      
            Message = $"{l.entity_type} {l.entity_id} was updated.", 
            Timestamp = l.timestamp
        }).ToList();
    }

    public async Task<List<GroupRadarMetricResponse>> GetGroupRadarMetricsAsync(long courseId)
    {
        // Fetch projects in the specified course
        var projects = await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Where(p => p.course_id == courseId)
            .Include(p => p.team_members)
            .Include(p => p.project_integration)
            .Include(p => p.project_documents)
            .ToListAsync();

        if (!projects.Any()) return new List<GroupRadarMetricResponse>();

        // Fetch commit counts per repo
        var repoIds = projects
            .Where(p => p.project_integration != null && p.project_integration.github_repo_id.HasValue)
            .Select(p => p.project_integration!.github_repo_id!.Value)
            .ToList();

        var repoCommitCounts = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => repoIds.Contains(c.repo_id))
            .GroupBy(c => c.repo_id)
            .ToDictionaryAsync(g => g.Key, g => g.Count());

        // Find Max Commits to Normalize
        int maxCommits = repoCommitCounts.Values.DefaultIfEmpty(0).Max();

        var radarData = new List<GroupRadarMetricResponse>();

        foreach (var p in projects)
        {
            // 1. Commits (Normalize to 100)
            int commitCount = 0;
            if (p.project_integration != null && p.project_integration.github_repo_id.HasValue)
            {
                var rId = p.project_integration.github_repo_id.Value;
                if (repoCommitCounts.ContainsKey(rId))
                {
                    commitCount = repoCommitCounts[rId];
                }
            }
            int commitScore = maxCommits > 0 ? (int)Math.Round((double)commitCount * 100 / maxCommits) : 0;

            // 2. SrsDone
            int srsScore = 0;
            var srsDoc = p.project_documents.OrderByDescending(d => d.submitted_at).FirstOrDefault();
            if (srsDoc != null)
            {
                if (srsDoc.status == "APPROVED") srsScore = 100;
                else if (srsDoc.status == "PENDING") srsScore = 50;
            }

            // 3. TeamSize
            int memberCount = p.team_members.Count;
            int teamSizeScore = Math.Min(100, memberCount * 20);

            // 4. GithubLinked & 5. JiraLinked
            int githubScore = (p.project_integration != null && p.project_integration.github_repo_id.HasValue) ? 100 : 0;
            int jiraScore = (p.project_integration != null && p.project_integration.jira_project_id.HasValue) ? 100 : 0;

            radarData.Add(new GroupRadarMetricResponse
            {
                GroupName = p.name,
                Commits = commitScore,
                SrsDone = srsScore,
                TeamSize = teamSizeScore,
                GithubLinked = githubScore,
                JiraLinked = jiraScore
            });
        }

        return radarData;
    }

    public async Task<List<JiraGithubExport.Shared.Contracts.Responses.Courses.LecturerCourseStatResponse>> GetLecturerCoursesStatsAsync(long lecturerId)
    {
        // 1. Fetch lecturer with courses directly to ensure n-n mapping is resolved correctly
        var lecturerWithCourses = await _unitOfWork.Lecturers.Query()
            .AsNoTracking()
            .Include(l => l.courses)
                .ThenInclude(c => c.subject)
            .Include(l => l.courses)
                .ThenInclude(c => c.semester)
            .Include(l => l.courses)
                .ThenInclude(c => c.projects)
                    .ThenInclude(p => p.project_integration)
            .Include(l => l.courses)
                .ThenInclude(c => c.course_enrollments)
            .FirstOrDefaultAsync(l => l.user_id == lecturerId);

        var courses = lecturerWithCourses?.courses.ToList() ?? new List<course>();

        if (!courses.Any()) 
            return new List<JiraGithubExport.Shared.Contracts.Responses.Courses.LecturerCourseStatResponse>();

        var result = new List<JiraGithubExport.Shared.Contracts.Responses.Courses.LecturerCourseStatResponse>();
        
        // Prepare global commit query to avoid querying per course
        var allCourseProjectIds = courses.SelectMany(c => c.projects).Select(p => p.id).ToList();
        
        // Need to get repos for commits logic
        var allRepoIds = courses.SelectMany(c => c.projects)
            .Where(p => p.project_integration != null && p.project_integration.github_repo_id.HasValue)
            .Select(p => p.project_integration!.github_repo_id!.Value)
            .ToList();

        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7).Date;
        
        // Fetch recent commits (7 days) for timeline and LastCommit
        var recentCommits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => allRepoIds.Contains(c.repo_id) && c.committed_at.HasValue && c.committed_at.Value.Date >= sevenDaysAgo)
            .Select(c => new { c.repo_id, c.committed_at })
            .ToListAsync();

        var allDays = new List<string> { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };

        foreach (var course in courses)
        {
            var courseRepoIds = (course.projects ?? new List<project>())
                .Where(p => p.project_integration != null && p.project_integration.github_repo_id.HasValue)
                .Select(p => p.project_integration!.github_repo_id!.Value)
                .ToList();

            var courseCommits = recentCommits.Where(c => courseRepoIds.Contains(c.repo_id)).ToList();
            
            // Generate 7-day sparkline
            var chartData = courseCommits
                .GroupBy(c => c.committed_at!.Value.Date.DayOfWeek)
                .Select(g => new DailyCommitStat
                {
                    Day = g.Key.ToString().Substring(0, 3),
                    Commits = g.Count()
                }).ToList();

            var completeChartData = allDays.Select(day => new DailyCommitStat
            {
                Day = day,
                Commits = chartData.FirstOrDefault(c => c.Day == day)?.Commits ?? 0
            }).ToList();

            // Alerts logic (Reusing "Missing Repo" and "No Jira" logic as alerts)
            int alertsCount = course.projects.Count(p => 
                p.project_integration == null || 
                !p.project_integration.github_repo_id.HasValue || 
                !p.project_integration.jira_project_id.HasValue);

            result.Add(new JiraGithubExport.Shared.Contracts.Responses.Courses.LecturerCourseStatResponse
            {
                Id = course.id,
                Code = course.course_code,
                Name = course.subject?.subject_name ?? "Unknown",
                SubjectCode = course.subject?.subject_code ?? "Unknown",
                Semester = course.semester?.name ?? "Unknown",
                CurrentStudents = course.course_enrollments?.Count ?? 0,
                GroupCount = course.projects?.Count ?? 0,
                ActiveTeams = course.projects?.Count(p => p.project_integration?.github_repo_id != null) ?? 0,
                JiraConnected = course.projects?.Count(p => p.project_integration?.jira_project_id != null) ?? 0,
                AlertsCount = alertsCount,
                Archived = course.status == "CLOSED",
                LastCommit = courseCommits.Any() ? courseCommits.Max(c => c.committed_at) : null,
                CommitTrend = completeChartData
            });
        }

        return result;
    }

    public async Task<List<JiraGithubExport.Shared.Contracts.Responses.Notifications.NotificationResponse>> GetRecentNotificationsAsync(long userId)
    {
        var notifications = new List<JiraGithubExport.Shared.Contracts.Responses.Notifications.NotificationResponse>();

        // 1. Get pending invitations for this student (if user is student)
        var invitations = await _unitOfWork.TeamInvitations.Query()
            .AsNoTracking()
            .Include(i => i.project)
            .Include(i => i.invited_by_user)
            .Where(i => i.invited_student_user_id == userId && i.status == "PENDING")
            .OrderByDescending(i => i.created_at)
            .Take(5)
            .ToListAsync();

        foreach (var inv in invitations)
        {
            notifications.Add(new JiraGithubExport.Shared.Contracts.Responses.Notifications.NotificationResponse
            {
                Id = $"INV_{inv.id}",
                Type = "INVITATION",
                Message = $"Bạn nhận được lời mời tham gia dự án {inv.project?.name} từ {inv.invited_by_user?.full_name}",
                Timestamp = inv.created_at,
                IsRead = false,
                Metadata = new Dictionary<string, object> { { "projectId", inv.project_id }, { "invitationId", inv.id } }
            });
        }

        // 2. Get recent audit logs related to user's activity or courses
        // For simplicity, we get most recent relevant logs
        var auditLogs = await _unitOfWork.AuditLogs.Query()
            .AsNoTracking()
            .Where(a => a.performed_by_user_id == userId || a.entity_type == "COURSE")
            .OrderByDescending(a => a.timestamp)
            .Take(10)
            .ToListAsync();

        foreach (var log in auditLogs)
        {
            notifications.Add(new JiraGithubExport.Shared.Contracts.Responses.Notifications.NotificationResponse
            {
                Id = $"AUDIT_{log.id}",
                Type = "SYSTEM",
                Message = GetFriendlyMessage(log),
                Timestamp = log.timestamp,
                IsRead = true,
                Metadata = new Dictionary<string, object> { { "entityId", log.entity_id }, { "entityType", log.entity_type } }
            });
        }

        return notifications.OrderByDescending(n => n.Timestamp).Take(15).ToList();
    }

    private string GetFriendlyMessage(audit_log log)
    {
        return log.action switch
        {
            "CREATE_PROJECT" => $"Dự án mới đã được tạo trong lớp của bạn (ID: {log.entity_id})",
            "ENROLL_STUDENT" => "Bạn đã được ghi danh vào một lớp học mới",
            "LINK_GITHUB" => $"Dự án {log.entity_id} đã kết nối GitHub thành công",
            "ASSIGN_LECTURER" => "Bạn đã được phân công vào một lớp học mới",
            _ => $"{log.entity_type}: {log.action}"
        };
    }
}
