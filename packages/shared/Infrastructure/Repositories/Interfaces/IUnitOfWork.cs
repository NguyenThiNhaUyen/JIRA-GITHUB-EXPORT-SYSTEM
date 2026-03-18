using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces.Specific;
using JiraGithubExport.Shared.Models;
using System;
using System.Threading.Tasks;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<User> Users { get; }
    IGenericRepository<Student> Students { get; }
    IGenericRepository<Lecturer> Lecturers { get; }
    IGenericRepository<Role> Roles { get; }
    IGenericRepository<Semester> Semesters { get; }
    IGenericRepository<Subject> Subjects { get; }
    ICourseRepository Courses { get; }
    IGenericRepository<CourseEnrollment> CourseEnrollments { get; }
    IProjectRepository Projects { get; }
    IGenericRepository<TeamMember> TeamMembers { get; }
    IGenericRepository<ProjectIntegration> ProjectIntegrations { get; }
    IGenericRepository<ProjectDocument> ProjectDocuments { get; }
    IGenericRepository<GithubRepository> GitHubRepositories { get; }
    IGenericRepository<GithubCommit> GitHubCommits { get; }
    IGenericRepository<GithubPullRequest> GitHubPullRequests { get; }
    IGenericRepository<GithubUser> GitHubUsers { get; }
    IGenericRepository<JiraProject> JiraProjects { get; }
    IGenericRepository<JiraIssue> JiraIssues { get; }
    IGenericRepository<StudentActivityDaily> StudentActivityDailies { get; }
    IGenericRepository<InactiveAlert> InactiveAlerts { get; }
    IGenericRepository<ReportExport> ReportExports { get; }
    IGenericRepository<AuditLog> AuditLogs { get; }
    IGenericRepository<TeamInvitation> TeamInvitations { get; }
    IGenericRepository<ExternalAccount> ExternalAccounts { get; }
    IGenericRepository<Notification> Notifications { get; }

    IGenericRepository<T> Repository<T>() where T : class;

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
