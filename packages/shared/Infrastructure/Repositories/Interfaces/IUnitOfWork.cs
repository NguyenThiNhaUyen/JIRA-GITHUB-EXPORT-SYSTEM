using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces.Specific;
using JiraGithubExport.Shared.Models;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<user> Users { get; }
    IGenericRepository<student> Students { get; }
    IGenericRepository<lecturer> Lecturers { get; }
    IGenericRepository<role> Roles { get; }
    IGenericRepository<semester> Semesters { get; }
    IGenericRepository<subject> Subjects { get; }
    ICourseRepository Courses { get; }
    IGenericRepository<course_enrollment> CourseEnrollments { get; }
    IProjectRepository Projects { get; }
    IGenericRepository<team_member> TeamMembers { get; }
    IGenericRepository<project_integration> ProjectIntegrations { get; }
    IGenericRepository<project_document> ProjectDocuments { get; }
    IGenericRepository<github_repository> GitHubRepositories { get; }
    IGenericRepository<github_commit> GitHubCommits { get; }
    IGenericRepository<github_pull_request> GitHubPullRequests { get; }
    IGenericRepository<github_user> GitHubUsers { get; }
    IGenericRepository<jira_project> JiraProjects { get; }
    IGenericRepository<jira_issue> JiraIssues { get; }
    IGenericRepository<student_activity_daily> StudentActivityDailies { get; }
    IGenericRepository<inactive_alert> InactiveAlerts { get; }
    IGenericRepository<report_export> ReportExports { get; }
    IGenericRepository<audit_log> AuditLogs { get; }
    IGenericRepository<external_account> ExternalAccounts { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}







