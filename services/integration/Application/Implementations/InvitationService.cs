using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Common;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class InvitationService : IInvitationService
{
    private readonly JiraGithubToolDbContext _context;
    private readonly ILogger<InvitationService> _logger;
    private readonly IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> _hubContext;

    public InvitationService(
        JiraGithubToolDbContext context, 
        ILogger<InvitationService> logger,
        IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> hubContext)
    {
        _context = context;
        _logger = logger;
        _hubContext = hubContext;
    }

    public async Task<InvitationResponse> SendInvitationAsync(long projectId, long inviterUserId, CreateInvitationRequest request)
    {
        var Project = await _context.Projects.FindAsync(projectId)
            ?? throw new NotFoundException($"Project {projectId} not found");

        var Student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == request.StudentUserId)
            ?? throw new NotFoundException($"Student User {request.StudentUserId} not found");

        // Check if Student is already in the Project
        var isMember = await _context.TeamMembers
            .AnyAsync(tm => tm.ProjectId == projectId && tm.StudentUserId == request.StudentUserId);
        
        if (isMember)
        {
            throw new BusinessException("Student is already a member of this Project");
        }

        // Check for pending invitation
        var existingInvite = await _context.TeamInvitations
            .FirstOrDefaultAsync(i => i.ProjectId == projectId && i.InvitedStudentUserId == request.StudentUserId && i.Status == "PENDING");
            
        if (existingInvite != null)
        {
            throw new BusinessException("A pending invitation already exists for this Student");
        }

        var invitation = new TeamInvitation
        {
            ProjectId = projectId,
            InvitedByUserId = inviterUserId,
            InvitedStudentUserId = request.StudentUserId,
            Status = "PENDING",
            Message = request.Message,
            CreatedAt = DateTime.UtcNow
        };

        _context.TeamInvitations.Add(invitation);
        await _context.SaveChangesAsync();

        // Send real-time Notification
        try
        {
            await _hubContext.Clients.User(request.StudentUserId.ToString())
                .SendAsync("ReceiveNotification", new 
                { 
                    Id = $"INV_{invitation.Id}",
                    Type = "INVITATION", 
                    Message = $"Bạn đã nhận được lời mời tham gia dự án {Project.Name}",
                    Timestamp = DateTime.UtcNow,
                    isRead = false,
                    metadata = new Dictionary<string, object> 
                    { 
                        { "projectId", projectId }, 
                        { "invitationId", invitation.Id } 
                    }
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SignalR Notification for invitation {InvitationId}", invitation.Id);
        }

        _logger.LogInformation("User {InviterId} sent an invitation to Student {StudentId} for Project {ProjectId}", inviterUserId, request.StudentUserId, projectId);

        return await GetInvitationResponseAsync(invitation.Id);
    }

    public async Task<PagedResponse<InvitationResponse>> GetMyPendingInvitationsAsync(long studentUserId, PagedRequest request)
    {
        var query = _context.TeamInvitations
            .Include(i => i.Project).ThenInclude(p => p.Course)
            .Include(i => i.InvitedByUser)
            .Include(i => i.InvitedStudentUser.User)
            .Where(i => i.InvitedStudentUserId == studentUserId && i.Status == "PENDING")
            .OrderByDescending(i => i.CreatedAt)
            .AsQueryable();

        var total = await query.CountAsync();
        var page = request.Page > 0 ? request.Page : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 20;

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var mapped = items.Select(MapToResponse).ToList();

        return new PagedResponse<InvitationResponse>
        {
            Items = mapped,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task<InvitationResponse> AcceptInvitationAsync(long invitationId, long studentUserId)
    {
        var invitation = await _context.TeamInvitations
            .FirstOrDefaultAsync(i => i.Id == invitationId && i.InvitedStudentUserId == studentUserId)
            ?? throw new NotFoundException($"Invitation {invitationId} not found or doesn't belong to tracking User");

        if (invitation.Status != "PENDING")
        {
            throw new BusinessException("Invitation is not pending");
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            invitation.Status = "ACCEPTED";
            invitation.RespondedAt = DateTime.UtcNow;

            // Add to team members (if not already there)
            var exists = await _context.TeamMembers
                .AnyAsync(tm => tm.ProjectId == invitation.ProjectId && tm.StudentUserId == studentUserId);

            if (!exists)
            {
                var newMember = new TeamMember
                {
                    ProjectId = invitation.ProjectId,
                    StudentUserId = studentUserId,
                    TeamRole = "MEMBER",
                    ParticipationStatus = "ACTIVE",
                    ContributionScore = 0m,
                    JoinedAt = DateTime.UtcNow
                };
                _context.TeamMembers.Add(newMember);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Student {StudentId} accepted invitation {InvitationId}", studentUserId, invitationId);
            return await GetInvitationResponseAsync(invitation.Id);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Failed to accept invitation {InvitationId}", invitationId);
            throw;
        }
    }

    public async Task<InvitationResponse> RejectInvitationAsync(long invitationId, long studentUserId)
    {
        var invitation = await _context.TeamInvitations
            .FirstOrDefaultAsync(i => i.Id == invitationId && i.InvitedStudentUserId == studentUserId)
            ?? throw new NotFoundException($"Invitation {invitationId} not found or doesn't belong to tracking User");

        if (invitation.Status != "PENDING")
        {
            throw new BusinessException("Invitation is not pending");
        }

        invitation.Status = "REJECTED";
        invitation.RespondedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Student {StudentId} rejected invitation {InvitationId}", studentUserId, invitationId);
        
        return await GetInvitationResponseAsync(invitation.Id);
    }

    private async Task<InvitationResponse> GetInvitationResponseAsync(long invitationId)
    {
        var i = await _context.TeamInvitations
            .Include(inv => inv.Project).ThenInclude(p => p.Course)
            .Include(inv => inv.InvitedByUser)
            .Include(inv => inv.InvitedStudentUser.User)
            .FirstOrDefaultAsync(inv => inv.Id == invitationId)
            ?? throw new NotFoundException($"Invitation {invitationId} not found");

        return MapToResponse(i);
    }

    private static InvitationResponse MapToResponse(TeamInvitation i)
    {
        return new InvitationResponse
        {
            Id = i.Id,
            ProjectId = i.ProjectId,
            ProjectName = i.Project?.Name ?? "",
            CourseId = i.Project?.CourseId ?? 0,
            CourseName = i.Project?.Course?.CourseName ?? "N/A",
            InvitedByUserId = i.InvitedByUserId,
            InvitedByName = i.InvitedByUser?.FullName ?? "",
            InvitedStudentUserId = i.InvitedStudentUserId,
            InvitedStudentName = i.InvitedStudentUser?.User?.FullName ?? "",
            Status = i.Status,
            Message = i.Message,
            CreatedAt = i.CreatedAt,
            RespondedAt = i.RespondedAt
        };
    }
}
