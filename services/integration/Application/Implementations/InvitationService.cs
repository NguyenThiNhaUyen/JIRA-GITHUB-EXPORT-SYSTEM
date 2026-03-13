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
    private readonly Microsoft.AspNetCore.SignalR.IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> _hubContext;

    public InvitationService(
        JiraGithubToolDbContext context, 
        ILogger<InvitationService> logger,
        Microsoft.AspNetCore.SignalR.IHubContext<JiraGithubExport.IntegrationService.Hubs.NotificationHub> hubContext)
    {
        _context = context;
        _logger = logger;
        _hubContext = hubContext;
    }

    public async Task<InvitationResponse> SendInvitationAsync(long projectId, long inviterUserId, CreateInvitationRequest request)
    {
        var project = await _context.projects.FindAsync(projectId)
            ?? throw new NotFoundException($"Project {projectId} not found");

        var student = await _context.students.FirstOrDefaultAsync(s => s.user_id == request.StudentUserId)
            ?? throw new NotFoundException($"Student user {request.StudentUserId} not found");

        // Check if student is already in the project
        var isMember = await _context.team_members
            .AnyAsync(tm => tm.project_id == projectId && tm.student_user_id == request.StudentUserId);
        
        if (isMember)
        {
            throw new BusinessException("Student is already a member of this project");
        }

        // Check for pending invitation
        var existingInvite = await _context.team_invitations
            .FirstOrDefaultAsync(i => i.project_id == projectId && i.invited_student_user_id == request.StudentUserId && i.status == "PENDING");
            
        if (existingInvite != null)
        {
            throw new BusinessException("A pending invitation already exists for this student");
        }

        var invitation = new team_invitation
        {
            project_id = projectId,
            invited_by_user_id = inviterUserId,
            invited_student_user_id = request.StudentUserId,
            status = "PENDING",
            message = request.Message,
            created_at = DateTime.UtcNow
        };

        _context.team_invitations.Add(invitation);
        await _context.SaveChangesAsync();

        // Send real-time notification
        try
        {
            await _hubContext.Clients.User(request.StudentUserId.ToString())
                .SendAsync("ReceiveNotification", new 
                { 
                    id = $"INV_{invitation.id}",
                    type = "INVITATION", 
                    message = $"Bạn đã nhận được lời mời tham gia dự án {project.name}",
                    timestamp = DateTime.UtcNow,
                    isRead = false,
                    metadata = new Dictionary<string, object> 
                    { 
                        { "projectId", projectId }, 
                        { "invitationId", invitation.id } 
                    }
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SignalR notification for invitation {InvitationId}", invitation.id);
        }

        _logger.LogInformation("User {InviterId} sent an invitation to student {StudentId} for project {ProjectId}", inviterUserId, request.StudentUserId, projectId);

        return await GetInvitationResponseAsync(invitation.id);
    }

    public async Task<PagedResponse<InvitationResponse>> GetMyPendingInvitationsAsync(long studentUserId, PagedRequest request)
    {
        var query = _context.team_invitations
            .Include(i => i.project)
            .Include(i => i.invited_by_user)
            .Include(i => i.invited_student_user.user)
            .Where(i => i.invited_student_user_id == studentUserId && i.status == "PENDING")
            .OrderByDescending(i => i.created_at)
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
            TotalItems = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task<InvitationResponse> AcceptInvitationAsync(long invitationId, long studentUserId)
    {
        var invitation = await _context.team_invitations
            .FirstOrDefaultAsync(i => i.id == invitationId && i.invited_student_user_id == studentUserId)
            ?? throw new NotFoundException($"Invitation {invitationId} not found or doesn't belong to tracking user");

        if (invitation.status != "PENDING")
        {
            throw new BusinessException("Invitation is not pending");
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            invitation.status = "ACCEPTED";
            invitation.responded_at = DateTime.UtcNow;

            // Add to team members (if not already there)
            var exists = await _context.team_members
                .AnyAsync(tm => tm.project_id == invitation.project_id && tm.student_user_id == studentUserId);

            if (!exists)
            {
                var newMember = new team_member
                {
                    project_id = invitation.project_id,
                    student_user_id = studentUserId,
                    team_role = "MEMBER",
                    participation_status = "ACTIVE",
                    contribution_score = null,
                    joined_at = DateTime.UtcNow
                };
                _context.team_members.Add(newMember);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Student {StudentId} accepted invitation {InvitationId}", studentUserId, invitationId);
            return await GetInvitationResponseAsync(invitation.id);
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
        var invitation = await _context.team_invitations
            .FirstOrDefaultAsync(i => i.id == invitationId && i.invited_student_user_id == studentUserId)
            ?? throw new NotFoundException($"Invitation {invitationId} not found or doesn't belong to tracking user");

        if (invitation.status != "PENDING")
        {
            throw new BusinessException("Invitation is not pending");
        }

        invitation.status = "REJECTED";
        invitation.responded_at = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Student {StudentId} rejected invitation {InvitationId}", studentUserId, invitationId);
        
        return await GetInvitationResponseAsync(invitation.id);
    }

    private async Task<InvitationResponse> GetInvitationResponseAsync(long invitationId)
    {
        var i = await _context.team_invitations
            .Include(inv => inv.project)
            .Include(inv => inv.invited_by_user)
            .Include(inv => inv.invited_student_user.user)
            .FirstOrDefaultAsync(inv => inv.id == invitationId)
            ?? throw new NotFoundException($"Invitation {invitationId} not found");

        return MapToResponse(i);
    }

    private static InvitationResponse MapToResponse(team_invitation i)
    {
        return new InvitationResponse
        {
            Id = i.id,
            ProjectId = i.project_id,
            ProjectName = i.project?.name ?? "",
            InvitedByName = i.invited_by_user?.full_name ?? "",
            InvitedStudentUserId = i.invited_student_user_id,
            Status = i.status,
            Message = i.message,
            CreatedAt = i.created_at
        };
    }
}
