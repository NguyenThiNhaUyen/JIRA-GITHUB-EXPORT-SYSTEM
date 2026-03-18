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
        var Project = await _unitOfWork.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        if (Project == null)
        {
            _logger.LogWarning("Project not found: {ProjectId}", projectId);
            throw new NotFoundException("Project not found");
        }

        var Student = await _unitOfWork.Students.FirstOrDefaultAsync(s => s.UserId == request.StudentUserId);
        if (Student == null) throw new NotFoundException("Student not found");

        var enrollment = await _unitOfWork.CourseEnrollments.FirstOrDefaultAsync(e =>
            e.CourseId == Project.CourseId && e.StudentUserId == request.StudentUserId && e.Status == "ACTIVE");

        if (enrollment == null) throw new BusinessException("Student is not enrolled in this Course");

        var existingMember = await _unitOfWork.TeamMembers.FirstOrDefaultAsync(tm =>
            tm.ProjectId == projectId && tm.StudentUserId == request.StudentUserId && tm.ParticipationStatus == "ACTIVE");

        if (existingMember != null) throw new BusinessException("Student is already a team member");

        var activeProjectsInCourse = await _unitOfWork.TeamMembers.FindAsync(tm =>
            tm.StudentUserId == request.StudentUserId &&
            tm.ParticipationStatus == "ACTIVE" &&
            tm.Project.CourseId == Project.CourseId);

        if (activeProjectsInCourse.Any()) throw new BusinessException("Student is already in another Project in this Course");

        var teamMember = new TeamMember
        {
            ProjectId = projectId,
            StudentUserId = request.StudentUserId,
            TeamRole = request.TeamRole,
            Responsibility = request.Responsibility,
            ParticipationStatus = "ACTIVE",
            JoinedAt = DateTime.UtcNow
        };

        _unitOfWork.TeamMembers.Add(teamMember);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RemoveTeamMemberAsync(long projectId, long studentUserId)
    {
        var teamMember = await _unitOfWork.TeamMembers.FirstOrDefaultAsync(tm =>
            tm.ProjectId == projectId && tm.StudentUserId == studentUserId && tm.ParticipationStatus == "ACTIVE");

        if (teamMember == null) throw new NotFoundException("Team member not found");

        teamMember.ParticipationStatus = "LEFT";
        teamMember.LeftAt = DateTime.UtcNow;

        _unitOfWork.TeamMembers.Update(teamMember);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Student {StudentId} removed from Project {ProjectId}", studentUserId, projectId);
    }

    public async Task UpdateContributionScoreAsync(long projectId, long memberStudentUserId, decimal? score)
    {
        var teamMember = await _unitOfWork.TeamMembers.FirstOrDefaultAsync(tm =>
            tm.ProjectId == projectId && tm.StudentUserId == memberStudentUserId && tm.ParticipationStatus == "ACTIVE");

        if (teamMember == null) throw new NotFoundException("Team member not found");

        teamMember.ContributionScore = score ?? 0m;
        _unitOfWork.TeamMembers.Update(teamMember);
        await _unitOfWork.SaveChangesAsync();
    }
}
