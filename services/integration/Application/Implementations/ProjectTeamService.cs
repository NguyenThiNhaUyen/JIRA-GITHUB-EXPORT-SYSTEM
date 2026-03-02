using JiraGithubExport.IntegrationService.Application.Interfaces;
using JiraGithubExport.Shared.Common.Exceptions;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.Extensions.Logging;

namespace JiraGithubExport.IntegrationService.Application.Implementations;

public class ProjectTeamService : IProjectTeamService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProjectTeamService> _logger;

    public ProjectTeamService(IUnitOfWork unitOfWork, ILogger<ProjectTeamService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
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
}
