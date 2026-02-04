using AutoMapper;
using JiraGithubExport.Shared.Contracts.Requests.Auth;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Auth;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.IntegrationService.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ============================================
        // USER MAPPINGS
        // ============================================

        CreateMap<user, UserInfo>()
            .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.roles.Select(r => r.role_name).ToList()))
            .ForMember(dest => dest.StudentCode, opt => opt.MapFrom(src => src.student != null ? src.student.student_code : null))
            .ForMember(dest => dest.LecturerCode, opt => opt.MapFrom(src => src.lecturer != null ? src.lecturer.lecturer_code : null));

        // ============================================
        // COURSE MAPPINGS
        // ============================================

        CreateMap<semester, SemesterInfo>();

        CreateMap<subject, SubjectInfo>();

        CreateMap<lecturer, LecturerInfo>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.user_id))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.user.full_name))
            .ForMember(dest => dest.LecturerCode, opt => opt.MapFrom(src => src.lecturer_code))
            .ForMember(dest => dest.OfficeEmail, opt => opt.MapFrom(src => src.office_email));

        CreateMap<course, CourseDetailResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.id))
            .ForMember(dest => dest.CourseCode, opt => opt.MapFrom(src => src.course_code))
            .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.course_name))
            .ForMember(dest => dest.Subject, opt => opt.MapFrom(src => src.subject))
            .ForMember(dest => dest.Semester, opt => opt.MapFrom(src => src.semester))
            .ForMember(dest => dest.EnrolledStudentsCount, opt => opt.MapFrom(src => src.course_enrollments.Count(e => e.status == "ACTIVE")))
            .ForMember(dest => dest.ProjectsCount, opt => opt.MapFrom(src => src.projects.Count(p => p.status == "ACTIVE")))
            .ForMember(dest => dest.Lecturers, opt => opt.MapFrom(src => src.lecturer_users));

        // ============================================
        // PROJECT MAPPINGS
        // ============================================

        CreateMap<team_member, TeamMemberInfo>()
            .ForMember(dest => dest.StudentUserId, opt => opt.MapFrom(src => src.student_user_id))
            .ForMember(dest => dest.StudentCode, opt => opt.MapFrom(src => src.student_user.student_code))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.student_user.user.full_name))
            .ForMember(dest => dest.TeamRole, opt => opt.MapFrom(src => src.team_role))
            .ForMember(dest => dest.ParticipationStatus, opt => opt.MapFrom(src => src.participation_status))
            .ForMember(dest => dest.Responsibility, opt => opt.MapFrom(src => src.responsibility))
            .ForMember(dest => dest.JoinedAt, opt => opt.MapFrom(src => src.joined_at));

        CreateMap<project_integration, IntegrationInfo>()
            .ForMember(dest => dest.GithubRepoUrl, opt => opt.MapFrom(src => src.github_repo != null ? src.github_repo.repo_url : null))
            .ForMember(dest => dest.GithubRepoOwner, opt => opt.MapFrom(src => src.github_repo != null ? src.github_repo.owner_login : null))
            .ForMember(dest => dest.GithubRepoName, opt => opt.MapFrom(src => src.github_repo != null ? src.github_repo.name : null))
            .ForMember(dest => dest.JiraProjectKey, opt => opt.MapFrom(src => src.jira_project != null ? src.jira_project.jira_project_key : null))
            .ForMember(dest => dest.JiraSiteUrl, opt => opt.MapFrom(src => src.jira_project != null ? src.jira_project.jira_url : null));

        CreateMap<project, ProjectDetailResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.name))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.description))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status))
            .ForMember(dest => dest.CourseId, opt => opt.MapFrom(src => src.course_id))
            .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.course.course_name))
            .ForMember(dest => dest.TeamCount, opt => opt.MapFrom(src => src.team_members.Count(tm => tm.participation_status == "ACTIVE")))
            .ForMember(dest => dest.TeamMembers, opt => opt.MapFrom(src => src.team_members.Where(tm => tm.participation_status == "ACTIVE")))
            .ForMember(dest => dest.Integration, opt => opt.MapFrom(src => src.project_integration));
    }
}








