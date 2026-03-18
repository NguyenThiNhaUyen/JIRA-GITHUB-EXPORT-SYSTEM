using JiraGithubExport.Shared.Infrastructure.Persistence;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces;
using JiraGithubExport.Shared.Infrastructure.Repositories.Interfaces.Specific;
using JiraGithubExport.Shared.Infrastructure.Repositories.Implementations.Specific;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore.Storage;
using System.Collections.Concurrent;

namespace JiraGithubExport.Shared.Infrastructure.Repositories.Implementations;

public class UnitOfWork : IUnitOfWork
{
    private readonly JiraGithubToolDbContext _context;
    private IDbContextTransaction? _transaction;
    private readonly ConcurrentDictionary<string, object> _repositories;

    public UnitOfWork(JiraGithubToolDbContext context)
    {
        _context = context;
        _repositories = new ConcurrentDictionary<string, object>();
    }

    public IGenericRepository<User> Users => Repository<User>();
    public IGenericRepository<Student> Students => Repository<Student>();
    public IGenericRepository<Lecturer> Lecturers => Repository<Lecturer>();
    public IGenericRepository<Role> Roles => Repository<Role>();
    public IGenericRepository<Semester> Semesters => Repository<Semester>();
    public IGenericRepository<Subject> Subjects => Repository<Subject>();
    public ICourseRepository Courses => (ICourseRepository)_repositories.GetOrAdd("Course", _ => new CourseRepository(_context));
    public IGenericRepository<CourseEnrollment> CourseEnrollments => Repository<CourseEnrollment>();
    public IProjectRepository Projects => (IProjectRepository)_repositories.GetOrAdd("Project", _ => new ProjectRepository(_context));
    public IGenericRepository<TeamMember> TeamMembers => Repository<TeamMember>();
    public IGenericRepository<ProjectIntegration> ProjectIntegrations => Repository<ProjectIntegration>();
    public IGenericRepository<ProjectDocument> ProjectDocuments => Repository<ProjectDocument>();
    public IGenericRepository<GithubRepository> GitHubRepositories => Repository<GithubRepository>();
    public IGenericRepository<GithubCommit> GitHubCommits => Repository<GithubCommit>();
    public IGenericRepository<GithubPullRequest> GitHubPullRequests => Repository<GithubPullRequest>();
    public IGenericRepository<GithubUser> GitHubUsers => Repository<GithubUser>();
    public IGenericRepository<JiraProject> JiraProjects => Repository<JiraProject>();
    public IGenericRepository<JiraIssue> JiraIssues => Repository<JiraIssue>();
    public IGenericRepository<StudentActivityDaily> StudentActivityDailies => Repository<StudentActivityDaily>();
    public IGenericRepository<InactiveAlert> InactiveAlerts => Repository<InactiveAlert>();
    public IGenericRepository<ReportExport> ReportExports => Repository<ReportExport>();
    public IGenericRepository<AuditLog> AuditLogs => Repository<AuditLog>();
    public IGenericRepository<TeamInvitation> TeamInvitations => Repository<TeamInvitation>();
    public IGenericRepository<ExternalAccount> ExternalAccounts => Repository<ExternalAccount>();
    public IGenericRepository<Notification> Notifications => Repository<Notification>();

    public IGenericRepository<T> Repository<T>() where T : class
    {
        return (IGenericRepository<T>)_repositories.GetOrAdd(typeof(T).Name, _ => new GenericRepository<T>(_context));
    }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    public async Task BeginTransactionAsync() => _transaction = await _context.Database.BeginTransactionAsync();

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
        _context.Dispose();
        _transaction?.Dispose();
        GC.SuppressFinalize(this);
    }
}

