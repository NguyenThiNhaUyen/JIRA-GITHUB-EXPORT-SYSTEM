using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using JiraGithubExport.IntegrationService.Hubs;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ProjectTeamService : IProjectTeamService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProjectTeamService> _logger;
    private readonly IHubContext<NotificationHub> _hub;

    public ProjectTeamService(IUnitOfWork unitOfWork, ILogger<ProjectTeamService> logger, IHubContext<NotificationHub> hub)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _hub = hub;
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
        if (student == null) throw new NotFoundException("Student not found");

        var enrollment = await _unitOfWork.CourseEnrollments.FirstOrDefaultAsync(e =>
            e.course_id == project.course_id && e.student_user_id == request.StudentUserId && e.status == "ACTIVE");

        if (enrollment == null) throw new BusinessException("Student is not enrolled in this course");

        var existingMember = await _unitOfWork.TeamMembers.FirstOrDefaultAsync(tm =>
            tm.project_id == projectId && tm.student_user_id == request.StudentUserId && tm.participation_status == "ACTIVE");

        if (existingMember != null) throw new BusinessException("Student is already a team member");

        var activeProjectsInCourse = await _unitOfWork.TeamMembers.FindAsync(tm =>
            tm.student_user_id == request.StudentUserId &&
            tm.participation_status == "ACTIVE" &&
            tm.project.course_id == project.course_id);

        if (activeProjectsInCourse.Any()) throw new BusinessException("Student is already in another project in this course");

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

        try
        {
            var p = await _unitOfWork.Projects.Query()
                .Include(proj => proj.course)
                    .ThenInclude(c => c.lecturer_users)
                .FirstOrDefaultAsync(proj => proj.id == projectId);
            
            var userAdded = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.id == request.StudentUserId);
            
            if (p?.course?.lecturer_users != null && p.course.lecturer_users.Any() && userAdded != null)
            {
                var msg = new { 
                    Type = "MEMBER_ADDED", 
                    Message = $"Sinh viên '{userAdded.full_name}' ({userAdded.email}) vừa gia nhập nhóm '{p.name}' trong lớp {p.course.course_code}." 
                };
                foreach (var l in p.course.lecturer_users)
                {
                    await _hub.Clients.User(l.user_id.ToString()).SendAsync("ReceiveNotification", msg);
                }

                // notify the student
                var studentMsg = new { 
                    Type = "JOINED_GROUP", 
                    Message = $"Bạn đã được thêm vào nhóm '{p.name}' trong lớp {p.course.course_code}." 
                };
                await _hub.Clients.User(request.StudentUserId.ToString()).SendAsync("ReceiveNotification", studentMsg);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not send SignalR notification on member addition.");
        }
    }

    public async Task RemoveTeamMemberAsync(long projectId, long studentUserId)
    {
        var teamMember = await _unitOfWork.TeamMembers.FirstOrDefaultAsync(tm =>
            tm.project_id == projectId && tm.student_user_id == studentUserId && tm.participation_status == "ACTIVE");

        if (teamMember == null) throw new NotFoundException("Team member not found");

        teamMember.participation_status = "LEFT";
        teamMember.left_at = DateTime.UtcNow;

        _unitOfWork.TeamMembers.Update(teamMember);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Student {StudentId} removed from project {ProjectId}", studentUserId, projectId);
    }

    public async Task UpdateContributionScoreAsync(long projectId, long memberStudentUserId, decimal? score)
    {
        var teamMember = await _unitOfWork.TeamMembers.FirstOrDefaultAsync(tm =>
            tm.project_id == projectId && tm.student_user_id == memberStudentUserId && tm.participation_status == "ACTIVE");

        if (teamMember == null) throw new NotFoundException("Team member not found");

        teamMember.contribution_score = score;
        _unitOfWork.TeamMembers.Update(teamMember);
        await _unitOfWork.SaveChangesAsync();
    }
}
