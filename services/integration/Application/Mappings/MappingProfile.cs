using AutoMapper;
using JiraGithubExport.Shared.Contracts.Requests.Auth;
using JiraGithubExport.Shared.Contracts.Requests.Courses;
using JiraGithubExport.Shared.Contracts.Requests.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Auth;
using JiraGithubExport.Shared.Contracts.Responses.Courses;
using JiraGithubExport.Shared.Contracts.Responses.Projects;
using JiraGithubExport.Shared.Contracts.Responses.Users;
using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.IntegrationService.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Global DateOnly converters
        CreateMap<DateOnly, DateTime>().ConvertUsing(src => src.ToDateTime(TimeOnly.MinValue));
        CreateMap<DateOnly?, DateTime>().ConvertUsing(src => src.HasValue ? src.Value.ToDateTime(TimeOnly.MinValue) : DateTime.MinValue);
        CreateMap<DateTime, DateOnly>().ConvertUsing(src => DateOnly.FromDateTime(src));

        // ============================================
        // User MAPPINGS
        // ============================================

        CreateMap<User, UserDetailResponse>() // FE likely uses UserDetailResponse for details
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => 
                src.Roles.Any(r => r.RoleName == "ADMIN" || r.RoleName == "SUPER_ADMIN") ? "ADMIN" : 
                (src.Roles.Any(r => r.RoleName == "Lecturer") ? "Lecturer" : "Student")))
            .ForMember(dest => dest.StudentCode, opt => opt.MapFrom(src => src.Student != null ? src.Student.StudentCode : null))
            .ForMember(dest => dest.LecturerCode, opt => opt.MapFrom(src => src.Lecturer != null ? src.Lecturer.LecturerCode : null))
            .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.Lecturer != null ? src.Lecturer.Department : (src.Student != null ? src.Student.Department : null)))
            .ForMember(dest => dest.AssignedCourses, opt => opt.MapFrom(src => src.Lecturer != null ? src.Lecturer.Courses.Select(c => c.CourseCode).ToList() : new List<string>()))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));

        CreateMap<User, UserInfo>() 
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => 
                src.Roles.Any(r => r.RoleName == "ADMIN" || r.RoleName == "SUPER_ADMIN") ? "ADMIN" : 
                (src.Roles.Any(r => r.RoleName == "Lecturer") ? "Lecturer" : "Student")))
            .ForMember(dest => dest.StudentCode, opt => opt.MapFrom(src => src.Student != null ? src.Student.StudentCode : null))
            .ForMember(dest => dest.LecturerCode, opt => opt.MapFrom(src => src.Lecturer != null ? src.Lecturer.LecturerCode : null));

        // ============================================
        // Course MAPPINGS
        // ============================================

        CreateMap<Semester, SemesterInfo>()
            .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.StartDate))
            .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.EndDate));

        CreateMap<Subject, SubjectInfo>()
            .ForMember(dest => dest.SubjectCode, opt => opt.MapFrom(src => src.SubjectCode))
            .ForMember(dest => dest.SubjectName, opt => opt.MapFrom(src => src.SubjectName))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));

        CreateMap<Lecturer, LecturerInfo>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : "N/A"))
            .ForMember(dest => dest.LecturerCode, opt => opt.MapFrom(src => src.LecturerCode))
            .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.Department))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));

        CreateMap<Course, CourseDetailResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.CourseCode, opt => opt.MapFrom(src => src.CourseCode))
            .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.CourseName))
            .ForMember(dest => dest.SubjectId, opt => opt.MapFrom(src => src.SubjectId))
            .ForMember(dest => dest.SubjectCode, opt => opt.MapFrom(src => src.Subject != null ? src.Subject.SubjectCode : "N/A"))
            .ForMember(dest => dest.SemesterId, opt => opt.MapFrom(src => src.SemesterId))
            .ForMember(dest => dest.SemesterName, opt => opt.MapFrom(src => src.Semester != null ? src.Semester.Name : "N/A"))
            .ForMember(dest => dest.Lecturers, opt => opt.MapFrom(src => src.LecturerUsers ?? new List<Lecturer>()))
            .ForMember(dest => dest.Enrollments, opt => opt.MapFrom(src => (src.CourseEnrollments ?? new List<CourseEnrollment>()).Where(e => e.Status == "ACTIVE")))
            .ForMember(dest => dest.CurrentStudents, opt => opt.MapFrom(src => src.CourseEnrollments != null ? src.CourseEnrollments.Count(e => e.Status == "ACTIVE") : 0))
            .ForMember(dest => dest.MaxStudents, opt => opt.MapFrom(src => src.MaxStudents))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status));


        CreateMap<CourseEnrollment, EnrollmentInfo>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.StudentUserId))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.StudentUser != null && src.StudentUser.User != null ? src.StudentUser.User.FullName : "N/A"))
            .ForMember(dest => dest.StudentCode, opt => opt.MapFrom(src => src.StudentUser != null ? src.StudentUser.StudentCode : "N/A"));

        // ============================================
        // Project MAPPINGS
        // ============================================

        CreateMap<TeamMember, TeamMemberInfo>()
            .ForMember(dest => dest.StudentUserId, opt => opt.MapFrom(src => src.StudentUserId))
            .ForMember(dest => dest.StudentCode, opt => opt.MapFrom(src => src.StudentUser.StudentCode))
            .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.StudentUser.User.FullName))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.TeamRole))
            .ForMember(dest => dest.ParticipationStatus, opt => opt.MapFrom(src => src.ParticipationStatus))
            .ForMember(dest => dest.ContributionScore, opt => opt.MapFrom(src => 90)); // Sample score
        CreateMap<ProjectIntegration, IntegrationInfo>()
            .ForMember(dest => dest.GithubRepoUrl, opt => opt.MapFrom(src => src.GithubRepo != null ? src.GithubRepo.RepoUrl : null))
            .ForMember(dest => dest.GithubRepoOwner, opt => opt.MapFrom(src => src.GithubRepo != null ? src.GithubRepo.OwnerLogin : null))
            .ForMember(dest => dest.GithubRepoName, opt => opt.MapFrom(src => src.GithubRepo != null ? src.GithubRepo.Name : null))
            .ForMember(dest => dest.JiraProjectKey, opt => opt.MapFrom(src => src.JiraProject != null ? src.JiraProject.JiraProjectKey : null))
            .ForMember(dest => dest.JiraSiteUrl, opt => opt.MapFrom(src => src.JiraProject != null ? src.JiraProject.JiraUrl : null))
            .ForMember(dest => dest.ApprovalStatus, opt => opt.MapFrom(src => src.ApprovalStatus))
            .ForMember(dest => dest.SubmittedByUserId, opt => opt.MapFrom(src => src.SubmittedByUserId))
            .ForMember(dest => dest.SubmittedAt, opt => opt.MapFrom(src => src.SubmittedAt))
            .ForMember(dest => dest.ApprovedByUserId, opt => opt.MapFrom(src => src.ApprovedByUserId))
            .ForMember(dest => dest.ApprovedByName, opt => opt.MapFrom(src => src.ApprovedBy != null ? src.ApprovedBy.FullName : null))
            .ForMember(dest => dest.ApprovedAt, opt => opt.MapFrom(src => src.ApprovedAt))
            .ForMember(dest => dest.RejectedReason, opt => opt.MapFrom(src => src.RejectedReason));

        // Bug #1 fix: ForPath on a nullable nested object causes AutoMapper crash at startup.
        // Use ForMember(Ignore) + AfterMap to construct IntegrationInfo safely.
        CreateMap<Project, ProjectDetailResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.CourseId, opt => opt.MapFrom(src => src.CourseId))
            .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.Course != null ? src.Course.CourseName : "N/A"))
            .ForMember(dest => dest.CourseCode, opt => opt.MapFrom(src => src.Course != null ? src.Course.CourseCode : ""))
            .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.TeamMembers != null ? src.TeamMembers.Where(tm => tm.ParticipationStatus == "ACTIVE") : Enumerable.Empty<JiraGithubExport.Shared.Models.TeamMember>()))
            .ForMember(dest => dest.GithubRepoUrl, opt => opt.MapFrom(src => src.ProjectIntegration != null && src.ProjectIntegration.GithubRepo != null ? src.ProjectIntegration.GithubRepo.RepoUrl : null))
            .ForMember(dest => dest.JiraProjectUrl, opt => opt.MapFrom(src => src.ProjectIntegration != null && src.ProjectIntegration.JiraProject != null ? src.ProjectIntegration.JiraProject.JiraUrl : null))
            .ForMember(dest => dest.GithubStatus, opt => opt.MapFrom(src => src.ProjectIntegration != null ? src.ProjectIntegration.ApprovalStatus : null))
            .ForMember(dest => dest.JiraStatus, opt => opt.MapFrom(src => src.ProjectIntegration != null ? (src.ProjectIntegration.JiraProject != null ? "LINKED" : "NONE") : null))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => (DateTime?)src.UpdatedAt))
            .ForMember(dest => dest.Integration, opt => opt.Ignore())
            .AfterMap((src, dest) =>
            {
                if (src.ProjectIntegration != null)
                    dest.Integration = new JiraGithubExport.Shared.Contracts.Responses.Projects.IntegrationInfo
                    {
                        GithubUrl = src.ProjectIntegration.GithubRepo?.RepoUrl,
                        GithubRepoOwner = src.ProjectIntegration.GithubRepo?.OwnerLogin,
                        GithubRepoName = src.ProjectIntegration.GithubRepo?.Name,
                        JiraUrl = src.ProjectIntegration.JiraProject?.JiraUrl,
                        JiraProjectKey = src.ProjectIntegration.JiraProject?.JiraProjectKey,
                        ApprovalStatus = src.ProjectIntegration.ApprovalStatus ?? "PENDING",
                        GithubStatus = src.ProjectIntegration.ApprovalStatus ?? "PENDING",
                        JiraStatus = src.ProjectIntegration.JiraProject != null ? "LINKED" : "NONE",
                        SubmittedByUserId = src.ProjectIntegration.SubmittedByUserId,
                        SubmittedAt = src.ProjectIntegration.SubmittedAt,
                        ApprovedByUserId = src.ProjectIntegration.ApprovedByUserId,
                        ApprovedByName = src.ProjectIntegration.ApprovedBy?.FullName,
                        ApprovedAt = src.ProjectIntegration.ApprovedAt,
                        RejectedReason = src.ProjectIntegration.RejectedReason
                    };
            });

        CreateMap<TeamInvitation, InvitationResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.GroupId, opt => opt.MapFrom(src => src.ProjectId))
            .ForMember(dest => dest.GroupName, opt => opt.MapFrom(src => src.Project.Name))
            .ForMember(dest => dest.CourseId, opt => opt.MapFrom(src => src.Project.CourseId))
            .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.Project.Course != null ? src.Project.Course.CourseName : "N/A"))
            .ForMember(dest => dest.InvitedByName, opt => opt.MapFrom(src => src.InvitedByUser.FullName))
            .ForMember(dest => dest.InvitedByStudentId, opt => opt.MapFrom(src => src.InvitedByUserId))
            .ForMember(dest => dest.InvitedStudentId, opt => opt.MapFrom(src => src.InvitedStudentUserId))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.Message, opt => opt.MapFrom(src => src.Message))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));

        CreateMap<ProjectDocument, SrsDocumentResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.ProjectId, opt => opt.MapFrom(src => src.ProjectId))
            .ForMember(dest => dest.VersionNo, opt => opt.MapFrom(src => src.VersionNo))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.FileUrl, opt => opt.MapFrom(src => src.FileUrl))
            .ForMember(dest => dest.SubmittedByName, opt => opt.MapFrom(src => src.SubmittedByUser != null ? src.SubmittedByUser.FullName : "N/A"))
            .ForMember(dest => dest.SubmittedAt, opt => opt.MapFrom(src => src.SubmittedAt))
            .ForMember(dest => dest.ReviewerName, opt => opt.MapFrom(src => src.ReviewerUser != null ? src.ReviewerUser.FullName : "N/A"))
            .ForMember(dest => dest.ReviewedAt, opt => opt.MapFrom(src => src.ReviewedAt))
            .ForMember(dest => dest.Feedback, opt => opt.MapFrom(src => src.Feedback))
            .ForMember(dest => dest.Score, opt => opt.MapFrom(src => src.Score))
            .ForMember(dest => dest.Metadata, opt => opt.MapFrom(src => src.Metadata));
    }
}

