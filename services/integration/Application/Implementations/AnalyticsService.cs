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
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using JiraGithubExport.Shared.Contracts.Requests.Courses;


namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class AnalyticsService : IAnalyticsService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AnalyticsService> _logger;
    private readonly Microsoft.AspNetCore.SignalR.IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> _hubContext;

    public AnalyticsService(
        IUnitOfWork unitOfWork, 
        ILogger<AnalyticsService> logger,
        IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> hubContext)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _hubContext = hubContext;
    }

    public async Task<AdminStatsResponse> GetAdminStatsAsync()
    {
        var semestersCount = await _unitOfWork.Semesters.Query().CountAsync();
        var subjectsCount = await _unitOfWork.Subjects.Query().CountAsync();
        var coursesCount = await _unitOfWork.Courses.Query().CountAsync();
        var projectsCount = await _unitOfWork.Projects.Query().CountAsync();

        var lecturerRoleUsers = await _unitOfWork.Users.Query()
            .Where(u => u.roles.Any(r => r.role_name == "LECTURER"))
            .CountAsync();
        var studentRoleUsers = await _unitOfWork.Users.Query()
            .Where(u => u.roles.Any(r => r.role_name == "STUDENT"))
            .CountAsync();

        return new AdminStatsResponse
        {
            Semesters = semestersCount,
            Subjects = subjectsCount,
            Courses = coursesCount,
            Lecturers = lecturerRoleUsers,
            Students = studentRoleUsers,
            Projects = projectsCount
        };
    }

    public async Task<List<DailyCommitStat>> GetCommitTrendsAsync(int days = 7)
    {
        var since = DateTime.UtcNow.AddDays(-days).Date;
        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => c.committed_at >= since)
            .Select(c => new { c.committed_at })
            .ToListAsync();

        var allDays = Enumerable.Range(0, days)
            .Select(i => DateTime.UtcNow.AddDays(-days + i + 1).Date)
            .ToList();

        return allDays.Select(d => new DailyCommitStat
        {
            Day = d.ToString("dd/MM"),  // FE expects: "09/03" format
            Commits = commits.Count(c => c.committed_at.HasValue && c.committed_at.Value.Date == d)
        }).ToList();
    }

    public async Task<List<HeatmapStat>> GetHeatmapAsync(int days = 90)
    {
        var since = DateTime.UtcNow.AddDays(-days).Date;
        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => c.committed_at >= since)
            .Select(c => new { c.committed_at })
            .ToListAsync();

        return commits
            .Where(c => c.committed_at.HasValue)
            .GroupBy(c => c.committed_at!.Value.Date)
            .Select(g => new HeatmapStat { Date = g.Key.ToString("yyyy-MM-dd"), Count = g.Count() })
            .OrderBy(h => h.Date)
            .ToList();
    }

    public async Task<List<TeamRankingStat>> GetTeamRankingsAsync(int limit = 4)
    {
        var analytics = await GetTeamAnalyticsAsync();
        return analytics.TopRanking.Take(limit).ToList();
    }

    public async Task<List<TeamWarningStat>> GetInactiveTeamsAsync()
    {
        var analytics = await GetTeamAnalyticsAsync();
        return analytics.InactiveWarning;
    }

    public async Task<List<DetailedTeamActivityStat>> GetTeamActivitiesAsync()
    {
        var analytics = await GetTeamAnalyticsAsync();
        return analytics.DetailedActivity;
    }

    public async Task<IntegrationStatsResponse> GetIntegrationStatsAsync()
    {
        try
        {
            int totalProjects = await _unitOfWork.Projects.Query().AsNoTracking().CountAsync();
            
            var integrations = await _unitOfWork.ProjectIntegrations.Query().AsNoTracking().ToListAsync();

            int repoConnected = integrations.Count(i => i.github_repo_id.HasValue);
            int jiraConnected = integrations.Count(i => i.jira_project_id.HasValue);

            int repoMissing = totalProjects - repoConnected;

            int reportsExported = 0;
            try 
            {
                reportsExported = await _unitOfWork.ReportExports.Query().AsNoTracking().CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Could not fetch reports exported count: {Message}", ex.Message);
            }

            return new IntegrationStatsResponse
            {
                RepoConnected = repoConnected,
                RepoMissing = repoMissing < 0 ? 0 : repoMissing,
                JiraConnected = jiraConnected,
                SyncErrors = 0,
                ReportsExported = reportsExported
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetIntegrationStatsAsync");
            throw; // Rethrow to let global error handler handle it, but now it's logged!
        }
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
            TeamId = p.id,
            TeamName = p.ProjectName,
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

        // Top Ranking (by Commits) — populate Team + Rank fields for FE
        var topRanking = detailedActivity
            .Where(d => d.TotalCommits > 0)
            .OrderByDescending(d => d.TotalCommits)
            .Take(5)
            .Select((d, idx) => new TeamRankingStat
            {
                TeamId = d.TeamId,
                Team = d.TeamName,       // FE: "team" field
                TeamName = d.TeamName,
                Commits = d.TotalCommits,
                Rank = idx + 1
            })
            .ToList();

        // Inactive Warning Logic
        var inactiveWarning = new List<TeamWarningStat>();
        foreach (var p in projects)
        {
            if (!p.HasRepo)
            {
                inactiveWarning.Add(new TeamWarningStat
                {
                    Team = p.ProjectName,
                    TeamName = p.ProjectName,
                    Reason = "Chưa kết nối GitHub",
                    LastActivity = null
                });
            }
            else if (!p.HasJira)
            {
                inactiveWarning.Add(new TeamWarningStat
                {
                    Team = p.ProjectName,
                    TeamName = p.ProjectName,
                    Reason = "Chưa kết nối Jira",
                    LastActivity = null
                });
            }
            else
            {
                var stat = detailedActivity.FirstOrDefault(d => d.TeamName == p.ProjectName);
                if (stat != null && stat.Status == "LOW")
                {
                    inactiveWarning.Add(new TeamWarningStat
                    {
                        Team = p.ProjectName,
                        TeamName = p.ProjectName,
                        Reason = "Không commit trong 7 ngày",
                        LastActivity = stat.LastCommitTime.HasValue ? stat.LastCommitTime.Value.ToString("yyyy-MM-dd") : null
                    });
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

        return logs.Select(l =>
        {
            var minutesAgo = (int)(DateTime.UtcNow - l.timestamp).TotalMinutes;
            string timeStr = minutesAgo < 1 ? "vừa xong"
                : minutesAgo < 60 ? $"{minutesAgo} phút trước"
                : minutesAgo < 1440 ? $"{minutesAgo / 60} giờ trước"
                : $"{minutesAgo / 1440} ngày trước";

            string msgType = l.action switch
            {
                var a when a.Contains("GITHUB") || a.Contains("COMMIT") || a.Contains("REPO") => "github",
                var a when a.Contains("JIRA") => "jira",
                var a when a.Contains("CREATE") || a.Contains("ENROLL") => "success",
                var a when a.Contains("DELETE") || a.Contains("REJECT") => "warning",
                _ => "info"
            };

            string humanMessage = l.action switch
            {
                "CREATE_PROJECT" => $"Nhóm mới được tạo (ID: {l.entity_id})",
                "LINK_GITHUB" => $"Nhóm (ID: {l.entity_id}) đã kết nối GitHub",
                "LINK_JIRA" => $"Nhóm (ID: {l.entity_id}) đã kết nối Jira",
                "ENROLL_STUDENT" => $"Sinh viên mới đăng ký vào lớp (ID: {l.entity_id})",
                "SYNC_COMMITS" => $"Đồng bộ commit cho nhóm (ID: {l.entity_id})",
                "SUBMIT_SRS" => $"Nhóm (ID: {l.entity_id}) đã nộp tài liệu SRS",
                "ASSIGN_LECTURER" => $"Admin đã phân công giảng viên vào lớp (ID: {l.entity_id})",
                _ => $"{l.entity_type} — {l.action}"
            };

            return new AuditLogResponse
            {
                Type = msgType,
                Message = humanMessage,
                Time = timeStr,
                Timestamp = l.timestamp
            };
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
                    .ThenInclude(e => e.student_user)
                        .ThenInclude(s => s.user)
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
            int alertsCount = (course.projects ?? new List<project>()).Count(p => 
                p.project_integration?.github_repo_id.HasValue != true || 
                p.project_integration?.jira_project_id.HasValue != true);

            result.Add(new JiraGithubExport.Shared.Contracts.Responses.Courses.LecturerCourseStatResponse
            {
                Id = course.id,
                Code = course.course_code,
                Name = course.subject?.subject_name ?? "Unknown",
                SubjectCode = course.subject?.subject_code ?? "Unknown",
                Semester = course.semester?.name ?? "Unknown",
                CurrentStudents = course.course_enrollments?.Count ?? 0,
                ProjectsCount = course.projects?.Count ?? 0,
                ActiveTeams = course.projects?.Count(p => p.project_integration?.github_repo_id != null) ?? 0,
                JiraConnected = course.projects?.Count(p => p.project_integration?.jira_project_id != null) ?? 0,
                AlertsCount = alertsCount,
                Archived = course.status == "CLOSED",
                LastCommit = courseCommits.Any() ? courseCommits.Max(c => c.committed_at) : null,
                Enrollments = (course.course_enrollments ?? new List<course_enrollment>())
                    .Where(e => e.status == "ACTIVE")
                    .Select(e => new EnrollmentInfo
                    {
                        UserId = e.student_user_id,
                        FullName = e.student_user?.user?.full_name ?? "N/A",
                        StudentCode = e.student_user?.student_code ?? "N/A",
                        StudentId = e.student_user?.student_code ?? "N/A"
                    }).ToList(),
                CommitTrends = completeChartData.Select(c => c.Commits).ToList() // Return [int, int, int...] as requested
            });
        }

        return result;
    }

    public async Task<List<JiraGithubExport.Shared.Contracts.Responses.Notifications.NotificationResponse>> GetRecentNotificationsAsync(long userId)
    {
        try
        {
            var notifications = await _unitOfWork.Notifications.Query()
                .AsNoTracking()
                .Where(n => n.recipient_user_id == userId)
                .OrderByDescending(n => n.created_at)
                .Take(20)
                .ToListAsync();

            return notifications.Select(n =>
            {
                Dictionary<string, object>? metaObj = null;
                if (!string.IsNullOrEmpty(n.metadata))
                {
                    try { metaObj = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(n.metadata); }
                    catch { /* bỏ qua nếu metadata không phải JSON hợp lệ */ }
                }

                return new JiraGithubExport.Shared.Contracts.Responses.Notifications.NotificationResponse
                {
                    Id = n.id.ToString(),
                    Type = n.type ?? "SYSTEM",
                    Message = n.message ?? "",
                    Timestamp = n.created_at,
                    IsRead = n.is_read,
                    Metadata = metaObj
                };
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching notifications for user {UserId}", userId);
            return new List<JiraGithubExport.Shared.Contracts.Responses.Notifications.NotificationResponse>();
        }
    }

    public async Task BuildNotificationAsync(long userId, string type, string message, string? metadata = null)
    {
        var notif = new notification
        {
            recipient_user_id = userId,
            type = type,
            message = message,
            is_read = false,
            created_at = DateTime.UtcNow,
            metadata = metadata
        };

        _unitOfWork.Notifications.Add(notif);
        await _unitOfWork.SaveChangesAsync();

        // Push real-time via SignalR
        try
        {
            await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new 
            {
                id = notif.id.ToString(),
                type = type,
                message = message,
                timestamp = notif.created_at,
                isRead = false,
                metadata = string.IsNullOrEmpty(metadata) ? null : System.Text.Json.JsonSerializer.Deserialize<object>(metadata)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SignalR notification to user {UserId}", userId);
        }
    }

    public async Task MarkNotificationAsReadAsync(long notificationId)
    {
        var notif = await _unitOfWork.Notifications.GetByIdAsync(notificationId);
        if (notif != null)
        {
            notif.is_read = true;
            _unitOfWork.Notifications.Update(notif);
            await _unitOfWork.SaveChangesAsync();
        }
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

    public async Task BulkAssignAsync(JiraGithubExport.Shared.Contracts.Requests.Courses.BulkAssignRequest request)
    {
        _logger.LogInformation("Starting bulk assign for {Count} items", request.Assignments?.Count ?? 0);
        
        if (request.Assignments == null || request.Assignments.Count == 0) return;

        var successfulAssignments = new List<(long LecturerId, string CourseCode, string? CourseName, long CourseId)>();

        foreach (var item in request.Assignments)
        {
            try 
            {
                // Step 1: Check if already assigned (avoid duplicate key)
                var alreadyAssigned = await _unitOfWork.Courses.Query()
                    .AsNoTracking()
                    .AnyAsync(c => c.id == item.CourseId && c.lecturer_users.Any(l => l.user_id == item.LecturerId));

                if (alreadyAssigned)
                {
                    _logger.LogInformation("Lecturer {LecturerId} is already assigned to course {CourseId}. Skipping.", item.LecturerId, item.CourseId);
                    continue;
                }

                // Step 2: Find or create lecturer record
                var lecturer = await _unitOfWork.Lecturers.Query()
                    .FirstOrDefaultAsync(l => l.user_id == item.LecturerId);
                
                if (lecturer == null)
                {
                    // Check if user exists at all
                    var user = await _unitOfWork.Users.Query()
                        .Include(u => u.roles)
                        .FirstOrDefaultAsync(u => u.id == item.LecturerId);
                        
                    if (user == null)
                    {
                        _logger.LogWarning("User {UserId} does not exist. Skipping.", item.LecturerId);
                        continue;
                    }

                    // Auto-create lecturer record (Admin explicitly chose this user, so we trust it)
                    _logger.LogInformation("Auto-creating lecturer record for user {UserId} ({FullName})", user.id, user.full_name);
                    lecturer = new lecturer
                    {
                        user_id = user.id,
                        lecturer_code = $"LEC_{user.id}",
                        department = "N/A",
                        created_at = DateTime.UtcNow,
                        updated_at = DateTime.UtcNow
                    };
                    _unitOfWork.Lecturers.Add(lecturer);
                    
                    // Also ensure user has LECTURER role
                    if (!user.roles.Any(r => r.role_name == "LECTURER"))
                    {
                        var lecturerRole = await _unitOfWork.Roles.Query()
                            .FirstOrDefaultAsync(r => r.role_name == "LECTURER");
                        if (lecturerRole != null)
                        {
                            user.roles.Add(lecturerRole);
                            _logger.LogInformation("Added LECTURER role to user {UserId}", user.id);
                        }
                    }
                    
                    await _unitOfWork.SaveChangesAsync();
                    _logger.LogInformation("Lecturer record created successfully for user {UserId}", user.id);
                }

                // Step 3: Fetch course WITH tracking
                var course = await _unitOfWork.Courses.Query()
                    .Include(c => c.lecturer_users)
                    .FirstOrDefaultAsync(c => c.id == item.CourseId);

                if (course == null)
                {
                    _logger.LogWarning("Course {CourseId} not found. Skipping.", item.CourseId);
                    continue;
                }

                // Step 4: Add lecturer to course
                if (!course.lecturer_users.Any(l => l.user_id == item.LecturerId))
                {
                    course.lecturer_users.Add(lecturer);
                    _logger.LogInformation("Queued assignment: Lecturer {LecturerId} -> Course {CourseId} ({CourseCode})", 
                        item.LecturerId, item.CourseId, course.course_code);
                    
                    successfulAssignments.Add((item.LecturerId, course.course_code, course.course_name, course.id));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error preparing assignment for course {CourseId}, lecturer {LecturerId}", item.CourseId, item.LecturerId);
            }
        }

        // Phase 2: Save ALL assignment changes
        if (successfulAssignments.Count > 0)
        {
            try
            {
                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("Saved {Count} lecturer assignments to database.", successfulAssignments.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save lecturer assignments.");
                throw;
            }

            // Phase 3: Create notifications AFTER data is committed
            foreach (var assignment in successfulAssignments)
            {
                try
                {
                    _logger.LogInformation("Creating notification for lecturer {LecturerId} about course {CourseCode}", 
                        assignment.LecturerId, assignment.CourseCode);
                    
                    await BuildNotificationAsync(assignment.LecturerId, "SYSTEM", 
                        $"Bạn đã được phân công vào lớp học {assignment.CourseCode} - {assignment.CourseName}",
                        System.Text.Json.JsonSerializer.Serialize(new { courseId = assignment.CourseId }));
                    
                    _logger.LogInformation("Notification created and pushed for lecturer {LecturerId}", assignment.LecturerId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send notification for lecturer {LecturerId}, but assignment was saved.", assignment.LecturerId);
                }
            }
        }
        else
        {
            _logger.LogInformation("No new assignments to save (all were already assigned or skipped).");
        }
    }



    public async Task<LecturerWorkloadResponse> GetLecturerWorkloadAsync(long lecturerId)
    {
        var courseCount = await _unitOfWork.Courses.Query()
            .Where(c => c.lecturer_users.Any(l => l.user_id == lecturerId))
            .CountAsync();
            
        var studentCount = await _unitOfWork.CourseEnrollments.Query()
            .Where(e => e.course.lecturer_users.Any(l => l.user_id == lecturerId) && e.status == "ACTIVE")
            .CountAsync();

        return new LecturerWorkloadResponse
        {
            CourseCount = courseCount,
            StudentCount = studentCount
        };
    }

    // ============================================================
    // STUDENT DASHBOARD APIs
    // ============================================================

    public async Task<StudentDashboardStatsResponse> GetStudentDashboardStatsAsync(long studentUserId)
    {
        // Get all projects this student is a team member of
        var teamMemberships = await _unitOfWork.TeamMembers.Query()
            .AsNoTracking()
            .Include(tm => tm.project)
                .ThenInclude(p => p.course)
            .Include(tm => tm.project)
                .ThenInclude(p => p.project_integration)
            .Where(tm => tm.student_user_id == studentUserId && tm.participation_status == "ACTIVE")
            .ToListAsync();

        var response = new StudentDashboardStatsResponse
        {
            TotalProjects = teamMemberships.Count
        };

        if (!teamMemberships.Any()) return response;

        // Collect all repo IDs for commit queries
        var repoMap = new Dictionary<long, long>(); // projectId -> repoId
        foreach (var tm in teamMemberships)
        {
            if (tm.project?.project_integration?.github_repo_id != null)
                repoMap[tm.project.id] = tm.project.project_integration.github_repo_id.Value;
        }

        var allRepoIds = repoMap.Values.Distinct().ToList();

        // Fetch commits grouped by repo
        var commitsByRepo = new Dictionary<long, int>();
        int totalStudentCommits = 0;
        int totalTeamCommits = 0;
        int totalPRs = 0;

        if (allRepoIds.Any())
        {
            // Total commits per repo
            var repoCommits = await _unitOfWork.GitHubCommits.Query()
                .AsNoTracking()
                .Where(c => allRepoIds.Contains(c.repo_id))
                .GroupBy(c => c.repo_id)
                .Select(g => new { RepoId = g.Key, Count = g.Count() })
                .ToListAsync();
            foreach (var rc in repoCommits)
                commitsByRepo[rc.RepoId] = rc.Count;

            totalTeamCommits = repoCommits.Sum(r => r.Count);

            // Student's personal commits (by matching user email to github_user email)
            var studentUser = await _unitOfWork.Users.GetByIdAsync(studentUserId);
            if (studentUser != null)
            {
                var studentGithubUsers = await _unitOfWork.GitHubUsers.Query()
                    .AsNoTracking()
                    .Where(gu => gu.email != null && gu.email == studentUser.email)
                    .Select(gu => gu.id)
                    .ToListAsync();

                if (studentGithubUsers.Any())
                {
                    totalStudentCommits = await _unitOfWork.GitHubCommits.Query()
                        .AsNoTracking()
                        .Where(c => allRepoIds.Contains(c.repo_id) && c.author_github_user_id.HasValue && studentGithubUsers.Contains(c.author_github_user_id.Value))
                        .CountAsync();
                }
            }

            // PRs
            totalPRs = await _unitOfWork.GitHubPullRequests.Query()
                .AsNoTracking()
                .Where(pr => allRepoIds.Contains(pr.repo_id))
                .CountAsync();
        }

        response.TotalCommits = totalStudentCommits;
        response.TotalPullRequests = totalPRs;
        response.ContributionPercent = totalTeamCommits > 0 
            ? Math.Round((double)totalStudentCommits * 100 / totalTeamCommits, 1) 
            : 0;

        // Weekly commits (last 7 days)
        int weeklyCommits = 0;
        if (allRepoIds.Any())
        {
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            weeklyCommits = await _unitOfWork.GitHubCommits.Query()
                .AsNoTracking()
                .Where(c => allRepoIds.Contains(c.repo_id) && c.committed_at >= sevenDaysAgo)
                .CountAsync();
        }

        // Jira tasks
        var jiraProjectIds = teamMemberships
            .Where(tm => tm.project?.project_integration?.jira_project_id != null)
            .Select(tm => tm.project!.project_integration!.jira_project_id!.Value)
            .Distinct()
            .ToList();

        if (jiraProjectIds.Any())
        {
            response.JiraTasksAssigned = await _unitOfWork.JiraIssues.Query()
                .AsNoTracking()
                .Where(i => jiraProjectIds.Contains(i.jira_project_id))
                .CountAsync();
            response.JiraTasksDone = await _unitOfWork.JiraIssues.Query()
                .AsNoTracking()
                .Where(i => jiraProjectIds.Contains(i.jira_project_id) && i.status != null && i.status.ToUpper() == "DONE")
                .CountAsync();
        }

        response.WeeklyCommits = weeklyCommits;
        response.TotalPullRequests = totalPRs;
        response.TotalPrs = totalPRs;
        response.TotalIssues = response.JiraTasksAssigned;

        // Build per-project info
        foreach (var tm in teamMemberships)
        {
            var proj = tm.project;
            if (proj == null) continue;

            int projCommits = 0;
            if (repoMap.TryGetValue(proj.id, out var rId) && commitsByRepo.TryGetValue(rId, out var cnt))
                projCommits = cnt;

            int openIssues = 0;
            int issuesDone = 0;
            int completionPct = 0;
            if (proj.project_integration?.jira_project_id != null)
            {
                var jpId = proj.project_integration.jira_project_id.Value;
                var totalIss = await _unitOfWork.JiraIssues.Query().CountAsync(i => i.jira_project_id == jpId);
                issuesDone = await _unitOfWork.JiraIssues.Query().CountAsync(i => i.jira_project_id == jpId && i.status != null && i.status.ToUpper() == "DONE");
                openIssues = totalIss - issuesDone;
                completionPct = totalIss > 0 ? (int)Math.Round((double)issuesDone * 100 / totalIss) : 0;
            }

            // relative last commit time
            string? lastCommitStr = null;
            if (proj.updated_at != default)
            {
                var mins = (int)(DateTime.UtcNow - proj.updated_at).TotalMinutes;
                lastCommitStr = mins < 60 ? $"{mins} phút trước"
                    : mins < 1440 ? $"{mins / 60} giờ trước"
                    : $"{mins / 1440} ngày trước";
            }

            response.Projects.Add(new StudentProjectInfo
            {
                ProjectId = proj.id,
                ProjectName = proj.name ?? "Unknown",
                CourseName = proj.course?.course_name ?? "N/A",
                CourseCode = proj.course?.course_code ?? "",
                Role = tm.team_role ?? "MEMBER",
                CommitCount = projCommits,
                Commits = projCommits,
                IssuesDone = issuesDone,
                OpenIssues = openIssues,
                CompletionPercent = completionPct,
                SprintCompletion = completionPct,
                Status = proj.status ?? "ACTIVE",
                LastCommit = lastCommitStr,
                LastActivity = proj.updated_at
            });
        }

        return response;
    }

    public async Task<List<StudentDeadlineResponse>> GetStudentDeadlinesAsync(long studentUserId)
    {
        // Get student's projects
        var projectIds = await _unitOfWork.TeamMembers.Query()
            .AsNoTracking()
            .Where(tm => tm.student_user_id == studentUserId && tm.participation_status == "ACTIVE")
            .Select(tm => tm.project_id)
            .ToListAsync();

        if (!projectIds.Any()) return new List<StudentDeadlineResponse>();

        // Get Jira project IDs
        var jiraProjectIds = await _unitOfWork.ProjectIntegrations.Query()
            .AsNoTracking()
            .Where(pi => projectIds.Contains(pi.project_id) && pi.jira_project_id != null)
            .Select(pi => new { pi.project_id, pi.jira_project_id })
            .ToListAsync();

        if (!jiraProjectIds.Any()) return new List<StudentDeadlineResponse>();

        var jpIds = jiraProjectIds.Select(j => j.jira_project_id!.Value).ToList();

        // Get active (non-DONE) issues with due dates
        var issues = await _unitOfWork.JiraIssues.Query()
            .AsNoTracking()
            .Include(i => i.jira_project)
            .Where(i => jpIds.Contains(i.jira_project_id) 
                && i.status != null 
                && i.status.ToUpper() != "DONE" 
                && i.status.ToUpper() != "CLOSED")
            .OrderByDescending(i => i.updated_at)
            .Take(20)
            .ToListAsync();

        // Get project names for display
        var projectNames = await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Where(p => projectIds.Contains(p.id))
            .ToDictionaryAsync(p => p.id, p => p.name ?? "Unknown");

        return issues.Select(i =>
        {
            var jpEntry = jiraProjectIds.FirstOrDefault(j => j.jira_project_id == i.jira_project_id);
            var projName = jpEntry != null && projectNames.ContainsKey(jpEntry.project_id) 
                ? projectNames[jpEntry.project_id] 
                : "Unknown";

            return new StudentDeadlineResponse
            {
                Id = i.jira_issue_key ?? i.id.ToString(),
                Title = i.title ?? "(no title)",
                DueDate = i.updated_at.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                Due = "Xem Jira",
                DaysLeft = 0,
                Severity = (i.priority?.ToUpper()) switch
                {
                    "HIGH" or "HIGHEST" or "BLOCKER" => "high",
                    "MEDIUM" => "medium",
                    _ => "low"
                },
                Project = projName,
                ProjectName = projName,
                Status = i.status ?? "TO DO",
                Priority = i.priority,
                IssueKey = i.jira_issue_key
            };
        }).ToList();
    }

    // ============================================================
    // LECTURER DASHBOARD APIs
    // ============================================================

    public async Task<List<LecturerActivityLogResponse>> GetLecturerActivityLogsAsync(long lecturerId, int limit = 10)
    {
        // Get course IDs that this lecturer manages
        var courseIds = await _unitOfWork.Courses.Query()
            .AsNoTracking()
            .Where(c => c.lecturer_users.Any(l => l.user_id == lecturerId))
            .Select(c => c.id)
            .ToListAsync();

        if (!courseIds.Any()) return new List<LecturerActivityLogResponse>();

        // Get project IDs in those courses
        var projectIds = await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Where(p => courseIds.Contains(p.course_id))
            .Select(p => p.id)
            .ToListAsync();

        // Get recent audit logs related to those projects or courses
        var logs = await _unitOfWork.AuditLogs.Query()
            .AsNoTracking()
            .Where(a => 
                (a.entity_type == "PROJECT" && projectIds.Contains(a.entity_id)) ||
                (a.entity_type == "COURSE" && courseIds.Contains(a.entity_id)))
            .OrderByDescending(a => a.timestamp)
            .Take(limit)
            .ToListAsync();

        // Get course and project names for display
        var courseNames = await _unitOfWork.Courses.Query()
            .AsNoTracking()
            .Where(c => courseIds.Contains(c.id))
            .ToDictionaryAsync(c => c.id, c => c.course_name ?? c.course_code);

        var projectInfo = await _unitOfWork.Projects.Query()
            .AsNoTracking()
            .Where(p => projectIds.Contains(p.id))
            .ToDictionaryAsync(p => p.id, p => new { p.name, p.course_id });

        return logs.Select(l =>
        {
            string courseName = "";
            string? projectName = null;

            if (l.entity_type == "PROJECT" && projectInfo.TryGetValue(l.entity_id, out var pInfo))
            {
                projectName = pInfo.name;
                courseName = courseNames.GetValueOrDefault(pInfo.course_id, "");
            }
            else if (l.entity_type == "COURSE" && courseNames.TryGetValue(l.entity_id, out var cName))
            {
                courseName = cName;
            }

            string message = l.action switch
            {
                "CREATE_PROJECT" => $"Nhóm '{projectName ?? l.entity_id.ToString()}' đã được tạo",
                "LINK_GITHUB" => $"Nhóm '{projectName ?? ""}' đã kết nối GitHub",
                "LINK_JIRA" => $"Nhóm '{projectName ?? ""}' đã kết nối Jira",
                "ENROLL_STUDENT" => $"Sinh viên mới đăng ký vào lớp",
                "SYNC_COMMITS" => $"Đồng bộ commit cho nhóm '{projectName ?? ""}'",
                "SUBMIT_SRS" => $"Nhóm '{projectName ?? ""}' đã nộp tài liệu SRS",
                _ => $"{l.entity_type} {l.entity_id}: {l.action}"
            };

            var minutesAgoLec = (int)(DateTime.UtcNow - l.timestamp).TotalMinutes;
            string timeLec = minutesAgoLec < 1 ? "vừa xong"
                : minutesAgoLec < 60 ? $"{minutesAgoLec} phút trước"
                : minutesAgoLec < 1440 ? $"{minutesAgoLec / 60} giờ trước"
                : $"{minutesAgoLec / 1440} ngày trước";

            string msgTypeLec = l.action switch
            {
                var a when a.Contains("GITHUB") || a.Contains("COMMIT") => "github",
                var a when a.Contains("JIRA") => "jira",
                _ => "info"
            };

            return new LecturerActivityLogResponse
            {
                Type = msgTypeLec,
                Message = message,
                Time = timeLec,
                CourseName = courseName,
                ProjectName = projectName,
                Timestamp = l.timestamp
            };
        }).ToList();
    }

    public async Task<List<DailyLabeledCommitStat>> GetStudentCommitActivityAsync(long studentUserId, int days = 7)
    {
        var since = DateTime.UtcNow.AddDays(-days).Date;
        var studentUser = await _unitOfWork.Users.GetByIdAsync(studentUserId);
        if (studentUser == null || string.IsNullOrEmpty(studentUser.email))
            return new List<DailyLabeledCommitStat>();

        var githubUserIds = await _unitOfWork.GitHubUsers.Query()
            .AsNoTracking()
            .Where(gu => gu.email != null && gu.email.ToLower() == studentUser.email.ToLower())
            .Select(gu => gu.id)
            .ToListAsync();

        if (!githubUserIds.Any())
            return new List<DailyLabeledCommitStat>();

        var projectIds = await _unitOfWork.TeamMembers.Query()
            .AsNoTracking()
            .Where(tm => tm.student_user_id == studentUserId && tm.participation_status == "ACTIVE")
            .Select(tm => tm.project_id)
            .ToListAsync();

        var repoIds = await _unitOfWork.ProjectIntegrations.Query()
            .AsNoTracking()
            .Where(pi => projectIds.Contains(pi.project_id) && pi.github_repo_id != null)
            .Select(pi => pi.github_repo_id!.Value)
            .ToListAsync();

        if (!repoIds.Any())
            return new List<DailyLabeledCommitStat>();

        var commits = await _unitOfWork.GitHubCommits.Query()
            .AsNoTracking()
            .Where(c => repoIds.Contains(c.repo_id) 
                && c.author_github_user_id.HasValue 
                && githubUserIds.Contains(c.author_github_user_id.Value)
                && c.committed_at >= since)
            .Select(c => new { c.committed_at })
            .ToListAsync();

        var allDays = Enumerable.Range(0, days)
            .Select(i => DateTime.UtcNow.AddDays(-days + i + 1).Date)
            .ToList();

        var dictLabels = new Dictionary<DayOfWeek, string>
        {
            { DayOfWeek.Monday, "T2" }, { DayOfWeek.Tuesday, "T3" }, { DayOfWeek.Wednesday, "T4" },
            { DayOfWeek.Thursday, "T5" }, { DayOfWeek.Friday, "T6" }, { DayOfWeek.Saturday, "T7" }, { DayOfWeek.Sunday, "CN" }
        };

        return allDays.Select(d => new DailyLabeledCommitStat
        {
            Label = dictLabels.GetValueOrDefault(d.DayOfWeek, d.DayOfWeek.ToString()),
            Commits = commits.Count(c => c.committed_at.HasValue && c.committed_at.Value.Date == d)
        }).ToList();
    }
}
