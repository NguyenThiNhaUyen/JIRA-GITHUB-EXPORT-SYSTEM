using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Implementations;

public class UnitOfWork : IUnitOfWork
{
    private readonly JiraGithubToolDbContext _context;
    private IDbContextTransaction? _transaction;

    // Repositories
    private IGenericRepository<user>? _users;
    private IGenericRepository<student>? _students;
    private IGenericRepository<lecturer>? _lecturers;
    private IGenericRepository<role>? _roles;
    private IGenericRepository<semester>? _semesters;
    private IGenericRepository<subject>? _subjects;
    private IGenericRepository<course>? _courses;
    private IGenericRepository<course_enrollment>? _courseEnrollments;
    private IGenericRepository<project>? _projects;
    private IGenericRepository<team_member>? _teamMembers;
    private IGenericRepository<project_integration>? _projectIntegrations;
    private IGenericRepository<project_document>? _projectDocuments;
    private IGenericRepository<github_repository>? _githubRepositories;
    private IGenericRepository<github_commit>? _githubCommits;
    private IGenericRepository<github_pull_request>? _githubPullRequests;
    private IGenericRepository<github_user>? _githubUsers;
    private IGenericRepository<jira_project>? _jiraProjects;
    private IGenericRepository<jira_issue>? _jiraIssues;
    private IGenericRepository<student_activity_daily>? _studentActivityDailies;
    private IGenericRepository<inactive_alert>? _inactiveAlerts;
    private IGenericRepository<report_export>? _reportExports;
    private IGenericRepository<audit_log>? _auditLogs;
    private IGenericRepository<external_account>? _externalAccounts;

    public UnitOfWork(JiraGithubToolDbContext context)
    {
        _context = context;
    }

    public IGenericRepository<user> Users => _users ??= new GenericRepository<user>(_context);
    public IGenericRepository<student> Students => _students ??= new GenericRepository<student>(_context);
    public IGenericRepository<lecturer> Lecturers => _lecturers ??= new GenericRepository<lecturer>(_context);
    public IGenericRepository<role> Roles => _roles ??= new GenericRepository<role>(_context);
    public IGenericRepository<semester> Semesters => _semesters ??= new GenericRepository<semester>(_context);
    public IGenericRepository<subject> Subjects => _subjects ??= new GenericRepository<subject>(_context);
    public IGenericRepository<course> Courses => _courses ??= new GenericRepository<course>(_context);
    public IGenericRepository<course_enrollment> CourseEnrollments => _courseEnrollments ??= new GenericRepository<course_enrollment>(_context);
    public IGenericRepository<project> Projects => _projects ??= new GenericRepository<project>(_context);
    public IGenericRepository<team_member> TeamMembers => _teamMembers ??= new GenericRepository<team_member>(_context);
    public IGenericRepository<project_integration> ProjectIntegrations => _projectIntegrations ??= new GenericRepository<project_integration>(_context);
    public IGenericRepository<project_document> ProjectDocuments => _projectDocuments ??= new GenericRepository<project_document>(_context);
    public IGenericRepository<github_repository> GitHubRepositories => _githubRepositories ??= new GenericRepository<github_repository>(_context);
    public IGenericRepository<github_commit> GitHubCommits => _githubCommits ??= new GenericRepository<github_commit>(_context);
    public IGenericRepository<github_pull_request> GitHubPullRequests => _githubPullRequests ??= new GenericRepository<github_pull_request>(_context);
    public IGenericRepository<github_user> GitHubUsers => _githubUsers ??= new GenericRepository<github_user>(_context);
    public IGenericRepository<jira_project> JiraProjects => _jiraProjects ??= new GenericRepository<jira_project>(_context);
    public IGenericRepository<jira_issue> JiraIssues => _jiraIssues ??= new GenericRepository<jira_issue>(_context);
    public IGenericRepository<student_activity_daily> StudentActivityDailies => _studentActivityDailies ??= new GenericRepository<student_activity_daily>(_context);
    public IGenericRepository<inactive_alert> InactiveAlerts => _inactiveAlerts ??= new GenericRepository<inactive_alert>(_context);
    public IGenericRepository<report_export> ReportExports => _reportExports ??= new GenericRepository<report_export>(_context);
    public IGenericRepository<audit_log> AuditLogs => _auditLogs ??= new GenericRepository<audit_log>(_context);
    public IGenericRepository<external_account> ExternalAccounts => _externalAccounts ??= new GenericRepository<external_account>(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}







