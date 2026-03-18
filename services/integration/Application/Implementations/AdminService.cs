using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Analytics;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class AdminService : IAdminService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminService> _logger;
    private readonly INotificationService _notificationService;

    public AdminService(
        IUnitOfWork unitOfWork,
        ILogger<AdminService> logger,
        INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task<AdminStatsResponse> GetAdminStatsAsync()
    {
        var semestersCount = await _unitOfWork.Semesters.Query().CountAsync();
        var subjectsCount = await _unitOfWork.Subjects.Query().CountAsync();
        var coursesCount = await _unitOfWork.Courses.Query().CountAsync();
        var projectsCount = await _unitOfWork.Projects.Query().CountAsync();

        var lecturerRoleUsers = await _unitOfWork.Users.Query()
            .Where(u => u.Roles.Any(r => r.RoleName == "LECTURER"))
            .CountAsync();
        var studentRoleUsers = await _unitOfWork.Users.Query()
            .Where(u => u.Roles.Any(r => r.RoleName == "STUDENT"))
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

    public async Task BulkAssignAsync(BulkAssignRequest request)
    {
        _logger.LogInformation("Starting bulk assign for {Count} items", request.Assignments?.Count ?? 0);
        
        if (request.Assignments == null || request.Assignments.Count == 0) return;

        var successfulAssignments = new List<(long LecturerId, string CourseCode, string? CourseName, long CourseId)>();

        foreach (var item in request.Assignments)
        {
            try 
            {
                var alreadyAssigned = await _unitOfWork.Courses.Query()
                    .AsNoTracking()
                    .AnyAsync(c => c.Id == item.CourseId && c.LecturerUsers.Any(l => l.UserId == item.LecturerId));

                if (alreadyAssigned) continue;

                var lecturer = await _unitOfWork.Lecturers.Query()
                    .FirstOrDefaultAsync(l => l.UserId == item.LecturerId);
                
                if (lecturer == null)
                {
                    var user = await _unitOfWork.Users.Query()
                        .Include(u => u.Roles)
                        .FirstOrDefaultAsync(u => u.Id == item.LecturerId);
                        
                    if (user == null) continue;

                    lecturer = new Lecturer
                    {
                        UserId = user.Id,
                        LecturerCode = $"LEC_{user.Id}",
                        Department = "N/A",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _unitOfWork.Lecturers.Add(lecturer);
                    
                    if (!user.Roles.Any(r => r.RoleName == "LECTURER"))
                    {
                        var lecturerRole = await _unitOfWork.Roles.Query()
                            .FirstOrDefaultAsync(r => r.RoleName == "LECTURER");
                        if (lecturerRole != null) user.Roles.Add(lecturerRole);
                    }
                    
                    await _unitOfWork.SaveChangesAsync();
                }

                var course = await _unitOfWork.Courses.Query()
                    .Include(c => c.LecturerUsers)
                    .FirstOrDefaultAsync(c => c.Id == item.CourseId);

                if (course != null)
                {
                    course.LecturerUsers.Add(lecturer);
                    successfulAssignments.Add((item.LecturerId, course.CourseCode, course.CourseName, course.Id));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error preparing assignment for course {CourseId}", item.CourseId);
            }
        }

        if (successfulAssignments.Count > 0)
        {
            await _unitOfWork.SaveChangesAsync();
            foreach (var assignment in successfulAssignments)
            {
                await _notificationService.BuildNotificationAsync(assignment.LecturerId, "SYSTEM", 
                    $"Bạn đã được phân công vào lớp học {assignment.CourseCode} - {assignment.CourseName}",
                    System.Text.Json.JsonSerializer.Serialize(new { courseId = assignment.CourseId }));
            }
        }
    }

    public async Task<List<AuditLogResponse>> GetRecentAuditLogsAsync(int count = 10)
    {
        var logs = await _unitOfWork.AuditLogs.Query()
            .AsNoTracking()
            .OrderByDescending(a => a.Timestamp)
            .Take(count)
            .ToListAsync();

        return logs.Select(l =>
        {
            var minutesAgo = (int)(DateTime.UtcNow - l.Timestamp).TotalMinutes;
            string timeStr = minutesAgo < 1 ? "vừa xong"
                : minutesAgo < 60 ? $"{minutesAgo} phút trước"
                : minutesAgo < 1440 ? $"{minutesAgo / 60} giờ trước"
                : $"{minutesAgo / 1440} ngày trước";

            string msgType = l.Action switch
            {
                var a when a.Contains("GITHUB") || a.Contains("COMMIT") || a.Contains("REPO") => "github",
                var a when a.Contains("JIRA") => "jira",
                var a when a.Contains("CREATE") || a.Contains("ENROLL") => "success",
                var a when a.Contains("DELETE") || a.Contains("REJECT") => "warning",
                _ => "info"
            };

            string humanMessage = l.Action switch
            {
                "CREATE_PROJECT" => $"Nhóm mới được tạo (ID: {l.EntityId})",
                "LINK_GITHUB" => $"Nhóm (ID: {l.EntityId}) đã kết nối GitHub",
                "LINK_JIRA" => $"Nhóm (ID: {l.EntityId}) đã kết nối Jira",
                "ENROLL_STUDENT" => $"Sinh viên mới đăng ký vào lớp (ID: {l.EntityId})",
                "SYNC_COMMITS" => $"Đồng bộ commit cho nhóm (ID: {l.EntityId})",
                "SUBMIT_SRS" => $"Nhóm (ID: {l.EntityId}) đã nộp tài liệu SRS",
                "ASSIGN_LECTURER" => $"Admin đã phân công giảng viên vào lớp (ID: {l.EntityId})",
                _ => $"{l.EntityType} — {l.Action}"
            };

            return new AuditLogResponse
            {
                Type = msgType,
                Message = humanMessage,
                Time = timeStr,
                Timestamp = l.Timestamp
            };
        }).ToList();
    }
}

