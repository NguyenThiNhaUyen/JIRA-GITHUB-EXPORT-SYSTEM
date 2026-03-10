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

        CreateMap<semester, SemesterInfo>()
            .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.name))
            .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.start_date ?? DateOnly.MinValue))
            .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.end_date ?? DateOnly.MinValue));

        CreateMap<subject, SubjectInfo>()
            .ForMember(dest => dest.SubjectCode, opt => opt.MapFrom(src => src.subject_code))
            .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.subject_name))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.created_at));

        CreateMap<lecturer, LecturerInfo>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.user_id))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.user != null ? src.user.full_name : "N/A"))
            .ForMember(dest => dest.LecturerCode, opt => opt.MapFrom(src => src.lecturer_code))
            .ForMember(dest => dest.OfficeEmail, opt => opt.MapFrom(src => src.office_email));

        CreateMap<course, CourseDetailResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.id))
            .ForMember(dest => dest.CourseCode, opt => opt.MapFrom(src => src.course_code))
            .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.course_name))
            .ForMember(dest => dest.SubjectId, opt => opt.MapFrom(src => src.subject_id))
            .ForMember(dest => dest.SubjectCode, opt => opt.MapFrom(src => src.subject != null ? src.subject.subject_code : "N/A"))
            .ForMember(dest => dest.SemesterId, opt => opt.MapFrom(src => src.semester_id))
            .ForMember(dest => dest.SemesterName, opt => opt.MapFrom(src => src.semester != null ? src.semester.name : "N/A"))
            .ForMember(dest => dest.Lecturers, opt => opt.MapFrom(src => src.lecturer_users))
            .ForMember(dest => dest.Enrollments, opt => opt.MapFrom(src => src.course_enrollments.Where(e => e.status == "ACTIVE")))
            .ForMember(dest => dest.MaxStudents, opt => opt.MapFrom(src => src.max_students))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status));

        CreateMap<course_enrollment, EnrollmentInfo>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.student_user_id))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.student_user != null && src.student_user.user != null ? src.student_user.user.full_name : "N/A"))
            .ForMember(dest => dest.StudentCode, opt => opt.MapFrom(src => src.student_user != null ? src.student_user.student_code : "N/A"));

        // ============================================
        // PROJECT MAPPINGS
        // ============================================

        CreateMap<team_member, TeamMemberInfo>()
            .ForMember(dest => dest.StudentUserId, opt => opt.MapFrom(src => src.student_user_id))
            .ForMember(dest => dest.StudentCode, opt => opt.MapFrom(src => src.student_user.student_code))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.student_user.user.full_name))
            .ForMember(dest => dest.TeamRole, opt => opt.MapFrom(src => src.team_role))
            .ForMember(dest => dest.ParticipationStatus, opt => opt.MapFrom(src => src.participation_status))
            .ForMember(dest => dest.ContributionScore, opt => opt.MapFrom(src => 90)); // Sample score

        CreateMap<project, ProjectDetailResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.name))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.description))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status))
            .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.course != null ? src.course.course_name : "N/A"))
            .ForMember(dest => dest.TeamMembers, opt => opt.MapFrom(src => src.team_members.Where(tm => tm.participation_status == "ACTIVE")))
            .ForMember(dest => dest.GithubRepoUrl, opt => opt.MapFrom(src => src.project_integration != null && src.project_integration.github_repo != null ? src.project_integration.github_repo.repo_url : null))
            .ForMember(dest => dest.JiraProjectUrl, opt => opt.MapFrom(src => src.project_integration != null && src.project_integration.jira_project != null ? src.project_integration.jira_project.jira_url : null))
            .ForMember(dest => dest.IntegrationStatus, opt => opt.MapFrom(src => src.project_integration != null ? src.project_integration.approval_status : "NONE"));

        CreateMap<team_invitation, InvitationResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.id))
            .ForMember(dest => dest.ProjectId, opt => opt.MapFrom(src => src.project_id))
            .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.project.name))
            .ForMember(dest => dest.InvitedByName, opt => opt.MapFrom(src => src.invited_by_user.full_name))
            .ForMember(dest => dest.InvitedStudentUserId, opt => opt.MapFrom(src => src.invited_student_user_id))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status))
            .ForMember(dest => dest.Message, opt => opt.MapFrom(src => src.message))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.created_at));

        CreateMap<project_document, SrsDocumentResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.id))
            .ForMember(dest => dest.ProjectId, opt => opt.MapFrom(src => src.project_id))
            .ForMember(dest => dest.VersionNo, opt => opt.MapFrom(src => src.version_no))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status))
            .ForMember(dest => dest.FileUrl, opt => opt.MapFrom(src => src.file_url))
            .ForMember(dest => dest.SubmittedByName, opt => opt.MapFrom(src => src.submitted_by_user != null ? src.submitted_by_user.full_name : "N/A"))
            .ForMember(dest => dest.SubmittedAt, opt => opt.MapFrom(src => src.submitted_at))
            .ForMember(dest => dest.ReviewerName, opt => opt.MapFrom(src => src.reviewer_user != null ? src.reviewer_user.full_name : "N/A"))
            .ForMember(dest => dest.ReviewedAt, opt => opt.MapFrom(src => src.reviewed_at))
            .ForMember(dest => dest.Feedback, opt => opt.MapFrom(src => src.feedback));
    }
}








