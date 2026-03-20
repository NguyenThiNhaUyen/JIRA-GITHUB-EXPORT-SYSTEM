using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.IntegrationService.Hubs;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

// Implementation of Alerting and Real-time Notification service
namespace JiraGithubExport.IntegrationService.Application.Implementations;


public class AlertService : IAlertService
{
    private readonly JiraGithubToolDbContext _context;
    private readonly IHubContext<NotificationHub> _hub;

    public AlertService(JiraGithubToolDbContext context, IHubContext<NotificationHub> hub)
    {
        _context = context;
        _hub     = hub;
    }

    public async Task<PagedResponse<AlertResponse>> GetAlertsAsync(long userId, string userRole, PagedRequest request)
    {
        var query = _context.inactive_alerts
            .Include(a => a.project)
            .AsQueryable();

        if (userRole == "LECTURER")
        {
            var lecturerProjectIds = await _context.projects
                .Where(p => p.course.lecturer_users.Any(l => l.user_id == userId))
                .Select(p => p.id)
                .ToListAsync();
            query = query.Where(a => a.project_id.HasValue && lecturerProjectIds.Contains(a.project_id.Value));
        }
        else if (userRole == "STUDENT")
        {
            var studentProjectIds = await _context.team_members
                .Where(tm => tm.student_user_id == userId && tm.participation_status == "ACTIVE")
                .Select(tm => tm.project_id)
                .ToListAsync();
            query = query.Where(a => a.project_id.HasValue && studentProjectIds.Contains(a.project_id.Value));
        }
        // ADMIN sees all alerts

        var page     = request.Page     > 0 ? request.Page     : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 20;
        var total    = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.created_at)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var mapped = items.Select(a => new AlertResponse
        {
            Id               = a.id,
            AlertType        = a.alert_type,
            TargetEntityType = a.target_entity_type,
            TargetEntityId   = a.target_entity_id,
            ProjectId        = a.project_id,
            ProjectName      = a.project?.name,
            Severity         = a.severity,
            Message          = a.message,
            ThresholdDays    = a.threshold_days,
            LastActivityAt   = a.last_activity_at,
            IsResolved       = a.is_resolved,
            ResolvedAt       = a.resolved_at,
            CreatedAt        = a.created_at
        }).ToList();

        return new PagedResponse<AlertResponse>
        {
            Items      = mapped,
            TotalCount = total,
            TotalItems = total,
            Page       = page,
            PageSize   = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task ResolveAlertAsync(long alertId, long resolvedByUserId)
    {
        var alert = await _context.inactive_alerts.FindAsync(alertId)
            ?? throw new NotFoundException($"Alert {alertId} not found");

        alert.is_resolved         = true;
        alert.resolved_at         = DateTime.UtcNow;
        alert.resolved_by_user_id = resolvedByUserId;
        await _context.SaveChangesAsync();

        // Push real-time: thông báo resolve đến group của project
        if (alert.project_id.HasValue)
        {
            await _hub.Clients
                .Group($"Project_{alert.project_id.Value}")
                .SendAsync("AlertResolved", new { alertId, resolvedAt = DateTime.UtcNow });
        }
    }

    public async Task SendAlertAsync(long projectId, string message, string severity = "MEDIUM")
    {
        var project = await _context.projects
            .Include(p => p.course)
            .Include(p => p.team_members)
            .FirstOrDefaultAsync(p => p.id == projectId)
            ?? throw new NotFoundException($"Project {projectId} not found");

        var alert = new inactive_alert
        {
            alert_type         = "MANUAL",
            target_entity_type = "PROJECT",
            target_entity_id   = projectId,
            project_id         = projectId,
            severity           = severity,
            message            = message,
            is_resolved        = false,
            created_at         = DateTime.UtcNow
        };
        _context.inactive_alerts.Add(alert);
        await _context.SaveChangesAsync();

        // ── SignalR real-time push ──
        var payload = new
        {
            alertId     = alert.id,
            projectId,
            projectName = project.name,
            message,
            severity,
            alertType   = "MANUAL",
            createdAt   = alert.created_at
        };
        var notification = new { Type = "NEW_ALERT", Payload = payload, Timestamp = DateTime.UtcNow };

        // 1. Broadcast đến Group của project (client đã JoinGroup)
        await _hub.Clients
            .Group($"Project_{projectId}")
            .SendAsync("ReceiveNotification", notification);

        // 2. Push trực tiếp từng user: thành viên nhóm + giảng viên
        var memberIds = project.team_members
            .Where(m => m.participation_status == "ACTIVE")
            .Select(m => m.student_user_id.ToString())
            .ToList();

        var lecturerIds = await _context.lecturers
            .Where(l => l.courses.Any(c => c.id == project.course_id))
            .Select(l => l.user_id.ToString())
            .ToListAsync();

        foreach (var uid in memberIds.Concat(lecturerIds).Distinct())
        {
            await _hub.Clients.User(uid).SendAsync("ReceiveNotification", notification);
        }
    }
}
