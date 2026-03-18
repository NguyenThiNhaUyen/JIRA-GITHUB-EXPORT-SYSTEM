using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class AlertService : IAlertService
{
    private readonly JiraGithubToolDbContext _context;

    public AlertService(JiraGithubToolDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResponse<AlertResponse>> GetAlertsAsync(long userId, string userRole, PagedRequest request)
    {
        var query = _context.InactiveAlerts
            .Include(a => a.Project)
            .AsQueryable();

        if (userRole == "Lecturer")
        {
            // Lecturer sees alerts for Projects in Courses they teach
            var lecturerProjectIds = await _context.Projects
                .Where(p => p.Course.LecturerUsers.Any(l => l.UserId == userId))
                .Select(p => p.Id)
                .ToListAsync();

            query = query.Where(a => lecturerProjectIds.Contains(a.ProjectId));
        }
        else if (userRole == "Student")
        {
            // Student sees alerts for their own Projects
            var studentProjectIds = await _context.TeamMembers
                .Where(tm => tm.StudentUserId == userId && tm.ParticipationStatus == "ACTIVE")
                .Select(tm => tm.ProjectId)
                .ToListAsync();

            query = query.Where(a => studentProjectIds.Contains(a.ProjectId));
        }
        // ADMIN sees all alerts

        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 20;
        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var mapped = items.Select(a => new AlertResponse
        {
            Id = a.Id,
            AlertType = a.AlertType,
            TargetEntityType = a.TargetEntityType,
            TargetEntityId = a.TargetEntityId,
            ProjectId = a.ProjectId,
            ProjectName = a.Project?.Name,
            Severity = a.Severity,
            Message = a.Message,
            ThresholdDays = a.ThresholdDays,
            LastActivityAt = a.LastActivityAt,
            IsResolved = a.IsResolved,
            ResolvedAt = a.ResolvedAt,
            CreatedAt = a.CreatedAt
        }).ToList();

        return new PagedResponse<AlertResponse>
        {
            Items = mapped,
            TotalCount = total,
            TotalItems = total, // Standardized alias
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task ResolveAlertAsync(long alertId, long resolvedByUserId)
    {
        var alert = await _context.InactiveAlerts.FindAsync(alertId)
            ?? throw new NotFoundException($"Alert {alertId} not found");

        alert.IsResolved = true;
        alert.ResolvedAt = DateTime.UtcNow;
        alert.ResolvedByUserId = resolvedByUserId;
        await _context.SaveChangesAsync();
    }

    public async Task SendAlertAsync(long projectId, string message, string severity = "MEDIUM")
    {
        var Project = await _context.Projects
            .Include(p => p.Course)
            .FirstOrDefaultAsync(p => p.Id == projectId);
        if (Project == null) throw new NotFoundException($"Project {projectId} not found");

        var alert = new InactiveAlert
        {
            AlertType = "MANUAL",
            TargetEntityType = "Project",
            TargetEntityId = projectId,
            ProjectId = projectId,
            Severity = severity,
            Message = message,
            IsResolved = false,
            CreatedAt = DateTime.UtcNow
        };
        _context.InactiveAlerts.Add(alert);
        await _context.SaveChangesAsync();
    }
}

