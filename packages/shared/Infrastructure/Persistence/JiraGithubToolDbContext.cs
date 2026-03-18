using System.Linq.Expressions;
using JiraGithubExport.Shared.Models;
using JiraGithubExport.Shared.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JiraGithubExport.Shared.Infrastructure.Persistence;

public partial class JiraGithubToolDbContext : DbContext
{
    public JiraGithubToolDbContext(DbContextOptions<JiraGithubToolDbContext> options)
        : base(options)
    {
    }

    public override int SaveChanges()
    {
        HandleProcessedEntities();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        HandleProcessedEntities();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void HandleProcessedEntities()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted);

        foreach (var entry in entries)
        {
            // Timestamps
            if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
            {
                var updatedAt = entry.Metadata.FindProperty("UpdatedAt");
                if (updatedAt != null)
                {
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
                }

                if (entry.State == EntityState.Added)
                {
                    var createdAt = entry.Metadata.FindProperty("CreatedAt");
                    if (createdAt != null)
                    {
                        entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
                    }
                }
            }

            // Soft Delete
            if (entry.State == EntityState.Deleted && entry.Entity is ISoftDelete softDelete)
            {
                entry.State = EntityState.Modified;
                softDelete.IsDeleted = true;
                
                // Also update UpdatedAt during soft delete
                var updatedAt = entry.Metadata.FindProperty("UpdatedAt");
                if (updatedAt != null)
                {
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
                }
            }
        }
    }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<CourseEnrollment> CourseEnrollments { get; set; }

    public virtual DbSet<ExternalAccount> ExternalAccounts { get; set; }

    public virtual DbSet<GithubBranch> GithubBranches { get; set; }

    public virtual DbSet<GithubCommit> GithubCommits { get; set; }

    public virtual DbSet<GithubIssue> GithubIssues { get; set; }

    public virtual DbSet<GithubIssueComment> GithubIssueComments { get; set; }

    public virtual DbSet<GithubPullRequest> GithubPullRequests { get; set; }

    public virtual DbSet<GithubRepository> GithubRepositories { get; set; }

    public virtual DbSet<GithubUser> GithubUsers { get; set; }

    public virtual DbSet<JiraAttachment> JiraAttachments { get; set; }

    public virtual DbSet<JiraIssue> JiraIssues { get; set; }

    public virtual DbSet<JiraIssueComment> JiraIssueComments { get; set; }

    public virtual DbSet<JiraIssueLink> JiraIssueLinks { get; set; }

    public virtual DbSet<JiraProject> JiraProjects { get; set; }

    public virtual DbSet<JiraWorklog> JiraWorklogs { get; set; }

    public virtual DbSet<Lecturer> Lecturers { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<ProjectDocument> ProjectDocuments { get; set; }

    public virtual DbSet<ProjectIntegration> ProjectIntegrations { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Semester> Semesters { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<Subject> Subjects { get; set; }

    public virtual DbSet<TeamMember> TeamMembers { get; set; }

    public virtual DbSet<TeamInvitation> TeamInvitations { get; set; }

    public virtual DbSet<User> Users { get; set; }


    public virtual DbSet<WorkLink> WorkLinks { get; set; }

    // New entities for PBL features
    public virtual DbSet<StudentActivityDaily> StudentActivityDailies { get; set; }

    public virtual DbSet<InactiveAlert> InactiveAlerts { get; set; }

    public virtual DbSet<ReportExport> ReportExports { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }
    public virtual DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply snake_case naming convention globally
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            // Table names
            var tableName = entity.GetTableName();
            if (tableName != null) entity.SetTableName(ToSnakeCase(tableName));

            // Column names
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ToSnakeCase(property.Name));
            }

            // Keys
            foreach (var key in entity.GetKeys())
            {
                var keyName = key.GetName();
                if (keyName != null) key.SetName(ToSnakeCase(keyName));
            }

            // Foreign keys
            foreach (var foreignKey in entity.GetForeignKeys())
            {
                var constraintName = foreignKey.GetConstraintName();
                if (constraintName != null) foreignKey.SetConstraintName(ToSnakeCase(constraintName));
            }

            // Indexes
            foreach (var index in entity.GetIndexes())
            {
                var indexName = index.GetDatabaseName();
                if (indexName != null) index.SetDatabaseName(ToSnakeCase(indexName));
            }
        }
        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("courses_pkey");

            entity.HasIndex(e => e.SemesterId, "idx_courses_semester_id");

            entity.HasIndex(e => e.SubjectId, "idx_courses_subject_id");

            entity.HasIndex(e => new { e.SemesterId, e.SubjectId, e.CourseCode }, "uq_courses_semester_subject_code").IsUnique();

            entity.Property(e => e.CourseCode).HasMaxLength(50);
            entity.Property(e => e.CourseName).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.CreatedByUser).WithMany(p => p.Courses)
                .HasForeignKey(d => d.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_courses_created_by");

            entity.HasOne(d => d.Semester).WithMany(p => p.Courses)
                .HasForeignKey(d => d.SemesterId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_courses_semester");

            entity.HasOne(d => d.Subject).WithMany(p => p.Courses)
                .HasForeignKey(d => d.SubjectId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_courses_subject");

            entity.HasMany(d => d.LecturerUsers).WithMany(p => p.Courses)
                .UsingEntity<Dictionary<string, object>>(
                    "course_lecturer",
                    r => r.HasOne<Lecturer>().WithMany()
                        .HasForeignKey("lecturer_user_id")
                        .HasConstraintName("fk_course_lecturers_lecturer"),
                    l => l.HasOne<Course>().WithMany()
                        .HasForeignKey("course_id")
                        .HasConstraintName("fk_course_lecturers_course"),
                    j =>
                    {
                        j.HasKey("course_id", "lecturer_user_id").HasName("course_lecturers_pkey");
                        j.ToTable("course_lecturers");
                        j.HasIndex(new[] { "lecturer_user_id" }, "idx_course_lecturers_lecturer_user_id");
                    });
        });

        modelBuilder.Entity<CourseEnrollment>(entity =>
        {
            entity.HasKey(e => new { e.CourseId, e.StudentUserId }).HasName("course_enrollments_pkey");

            entity.HasIndex(e => new { e.CourseId, e.Status }, "idx_course_enrollments_course_status");

            entity.HasIndex(e => e.StudentUserId, "idx_course_enrollments_student_user_id");

            entity.Property(e => e.EnrolledAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'ACTIVE'::character varying");

            entity.HasOne(d => d.Course).WithMany(p => p.CourseEnrollments)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("fk_course_enrollments_course");

            entity.HasOne(d => d.StudentUser).WithMany(p => p.CourseEnrollments)
                .HasForeignKey(d => d.StudentUserId)
                .HasConstraintName("fk_course_enrollments_student");
        });

        modelBuilder.Entity<ExternalAccount>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("external_accounts_pkey");

            entity.HasIndex(e => new { e.UserId, e.Provider }, "idx_external_accounts_user_provider");

            entity.HasIndex(e => new { e.Provider, e.ExternalUserKey }, "uq_external_accounts_provider_key").IsUnique();

            entity.HasIndex(e => new { e.UserId, e.Provider, e.ExternalUserKey }, "uq_external_accounts_user_provider_key").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.ExternalUserKey).HasMaxLength(255);
            entity.Property(e => e.Provider).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Username).HasMaxLength(255);

            entity.HasOne(d => d.User).WithMany(p => p.ExternalAccounts)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_external_accounts_user");
        });

        modelBuilder.Entity<GithubBranch>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("github_branches_pkey");

            entity.HasIndex(e => new { e.RepoId, e.BranchName }, "uq_github_branches_repo_branch").IsUnique();

            entity.Property(e => e.BranchName).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.HeadCommitSha).HasMaxLength(64);
            entity.Property(e => e.IsDefault).HasDefaultValue(false);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Repo).WithMany(p => p.GithubBranches)
                .HasForeignKey(d => d.RepoId)
                .HasConstraintName("fk_github_branches_repo");

            entity.HasMany(d => d.Commits).WithMany(p => p.Branches)
                .UsingEntity<Dictionary<string, object>>(
                    "github_commit_branch",
                    r => r.HasOne<GithubCommit>().WithMany()
                        .HasForeignKey("commit_id")
                        .HasConstraintName("fk_github_commit_branches_commit"),
                    l => l.HasOne<GithubBranch>().WithMany()
                        .HasForeignKey("branch_id")
                        .HasConstraintName("fk_github_commit_branches_branch"),
                    j =>
                    {
                        j.HasKey("branch_id", "commit_id").HasName("github_commit_branches_pkey");
                        j.ToTable("github_commit_branches");
                    });
        });

        modelBuilder.Entity<GithubCommit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("github_commits_pkey");

            entity.HasIndex(e => e.AuthorGithubUserId, "idx_github_commits_author");

            entity.HasIndex(e => new { e.RepoId, e.CommittedAt }, "idx_github_commits_repo_committed_at");

            entity.HasIndex(e => new { e.RepoId, e.CommitSha }, "uq_github_commits_repo_sha").IsUnique();

            entity.Property(e => e.CommitSha).HasMaxLength(64);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.AuthorGithubUser).WithMany(p => p.GithubCommitauthorGithubUsers)
                .HasForeignKey(d => d.AuthorGithubUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_commits_author");

            entity.HasOne(d => d.CommitterGithubUser).WithMany(p => p.GithubCommitcommitterGithubUsers)
                .HasForeignKey(d => d.CommitterGithubUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_commits_committer");

            entity.HasOne(d => d.Repo).WithMany(p => p.GithubCommits)
                .HasForeignKey(d => d.RepoId)
                .HasConstraintName("fk_github_commits_repo");
        });

        modelBuilder.Entity<GithubIssue>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("github_issues_pkey");

            entity.HasIndex(e => new { e.RepoId, e.State }, "idx_github_issues_repo_state");

            entity.HasIndex(e => new { e.RepoId, e.IssueNumber }, "uq_github_issues_repo_number").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.State).HasMaxLength(50);
            entity.Property(e => e.Title).HasMaxLength(512);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.AssigneeGithubUser).WithMany(p => p.GithubIssueassigneeGithubUsers)
                .HasForeignKey(d => d.AssigneeGithubUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_issues_assignee");

            entity.HasOne(d => d.AuthorGithubUser).WithMany(p => p.GithubIssueauthorGithubUsers)
                .HasForeignKey(d => d.AuthorGithubUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_issues_author");

            entity.HasOne(d => d.Repo).WithMany(p => p.GithubIssues)
                .HasForeignKey(d => d.RepoId)
                .HasConstraintName("fk_github_issues_repo");
        });

        modelBuilder.Entity<GithubIssueComment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("github_issue_comments_pkey");

            entity.HasIndex(e => new { e.IssueId, e.CreatedAt }, "idx_github_issue_comments_issue_created");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.AuthorGithubUser).WithMany(p => p.GithubIssueComments)
                .HasForeignKey(d => d.AuthorGithubUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_issue_comments_author");

            entity.HasOne(d => d.Issue).WithMany(p => p.GithubIssueComments)
                .HasForeignKey(d => d.IssueId)
                .HasConstraintName("fk_github_issue_comments_issue");
        });

        modelBuilder.Entity<GithubPullRequest>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("github_pull_requests_pkey");

            entity.HasIndex(e => e.AuthorGithubUserId, "idx_github_pull_requests_author");

            entity.HasIndex(e => new { e.RepoId, e.State }, "idx_github_pull_requests_repo_state");

            entity.HasIndex(e => new { e.RepoId, e.PrNumber }, "uq_github_pull_requests_repo_number").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.SourceBranch).HasMaxLength(255);
            entity.Property(e => e.State).HasMaxLength(50);
            entity.Property(e => e.TargetBranch).HasMaxLength(255);
            entity.Property(e => e.Title).HasMaxLength(512);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.AuthorGithubUser).WithMany(p => p.GithubPullRequests)
                .HasForeignKey(d => d.AuthorGithubUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_pull_requests_author");

            entity.HasOne(d => d.Repo).WithMany(p => p.GithubPullRequests)
                .HasForeignKey(d => d.RepoId)
                .HasConstraintName("fk_github_pull_requests_repo");
        });

        modelBuilder.Entity<GithubRepository>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("github_repositories_pkey");

            entity.HasIndex(e => e.FullName, "github_repositories_full_name_key").IsUnique();

            entity.HasIndex(e => e.GithubRepoId, "github_repositories_github_repo_id_key").IsUnique();

            entity.HasIndex(e => new { e.OwnerLogin, e.Name }, "uq_github_repositories_owner_name").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DefaultBranch).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(512);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.OwnerLogin).HasMaxLength(255);
            entity.Property(e => e.RepoUrl).HasMaxLength(512);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Visibility).HasMaxLength(50);
        });

        modelBuilder.Entity<GithubUser>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("github_users_pkey");

            entity.HasIndex(e => e.GithubUserId, "github_users_github_user_id_key").IsUnique();

            entity.HasIndex(e => e.Login, "github_users_login_key").IsUnique();

            entity.Property(e => e.AvatarUrl).HasMaxLength(512);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.DisplayName).HasMaxLength(255);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.Login).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UserType).HasMaxLength(50);
        });

        modelBuilder.Entity<JiraAttachment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("jira_attachments_pkey");

            entity.HasIndex(e => new { e.IssueId, e.UploadedAt }, "idx_jira_attachments_issue_uploaded");

            entity.Property(e => e.Filename).HasMaxLength(255);
            entity.Property(e => e.UploadedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Url).HasMaxLength(1024);

            entity.HasOne(d => d.Issue).WithMany(p => p.JiraAttachments)
                .HasForeignKey(d => d.IssueId)
                .HasConstraintName("fk_jira_attachments_issue");
        });

        modelBuilder.Entity<JiraIssue>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("jira_issues_pkey");

            entity.HasIndex(e => e.JiraProjectId, "idx_jira_issues_project_id");

            entity.HasIndex(e => new { e.JiraProjectId, e.Status }, "idx_jira_issues_project_status");

            entity.HasIndex(e => e.JiraIssueKey, "jira_issues_jira_issue_key_key").IsUnique();

            entity.Property(e => e.AssigneeJiraAccountId).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.IssueType).HasMaxLength(50);
            entity.Property(e => e.JiraIssueKey).HasMaxLength(50);
            entity.Property(e => e.Priority).HasMaxLength(50);
            entity.Property(e => e.ReporterJiraAccountId).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.JiraProject).WithMany(p => p.JiraIssues)
                .HasForeignKey(d => d.JiraProjectId)
                .HasConstraintName("fk_jira_issues_project");
        });

        modelBuilder.Entity<JiraIssueComment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("jira_issue_comments_pkey");

            entity.HasIndex(e => new { e.IssueId, e.CreatedAt }, "idx_jira_issue_comments_issue_created");

            entity.Property(e => e.AuthorJiraAccountId).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Issue).WithMany(p => p.JiraIssueComments)
                .HasForeignKey(d => d.IssueId)
                .HasConstraintName("fk_jira_issue_comments_issue");
        });

        modelBuilder.Entity<JiraIssueLink>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("jira_issue_links_pkey");

            entity.HasIndex(e => e.ChildIssueId, "idx_jira_issue_links_child");

            entity.HasIndex(e => e.ParentIssueId, "idx_jira_issue_links_parent");

            entity.HasIndex(e => new { e.ParentIssueId, e.ChildIssueId, e.LinkType }, "uq_jira_issue_links_parent_child_type").IsUnique();

            entity.Property(e => e.LinkType).HasMaxLength(50);

            entity.HasOne(d => d.ChildIssue).WithMany(p => p.JiraIssueLinkchildIssues)
                .HasForeignKey(d => d.ChildIssueId)
                .HasConstraintName("fk_jira_issue_links_child");

            entity.HasOne(d => d.ParentIssue).WithMany(p => p.JiraIssueLinkparentIssues)
                .HasForeignKey(d => d.ParentIssueId)
                .HasConstraintName("fk_jira_issue_links_parent");
        });

        modelBuilder.Entity<JiraProject>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("jira_projects_pkey");

            entity.HasIndex(e => e.JiraProjectKey, "jira_projects_jira_project_key_key").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.JiraProjectId).HasMaxLength(100);
            entity.Property(e => e.JiraProjectKey).HasMaxLength(50);
            entity.Property(e => e.JiraUrl).HasMaxLength(512);
            entity.Property(e => e.ProjectName).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<JiraWorklog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("jira_worklogs_pkey");

            entity.HasIndex(e => new { e.IssueId, e.AuthorJiraAccountId }, "idx_jira_worklogs_issue_author");

            entity.Property(e => e.AuthorJiraAccountId).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.TimeSpent).HasPrecision(6, 2);

            entity.HasOne(d => d.Issue).WithMany(p => p.JiraWorklogs)
                .HasForeignKey(d => d.IssueId)
                .HasConstraintName("fk_jira_worklogs_issue");
        });

        modelBuilder.Entity<Lecturer>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("lecturers_pkey");

            entity.HasIndex(e => e.LecturerCode, "lecturers_lecturer_code_key").IsUnique();

            entity.HasIndex(e => e.OfficeEmail, "lecturers_office_email_key").IsUnique();

            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Department).HasMaxLength(255);
            entity.Property(e => e.LecturerCode).HasMaxLength(50);
            entity.Property(e => e.OfficeEmail).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithOne(p => p.Lecturer)
                .HasForeignKey<Lecturer>(d => d.UserId)
                .HasConstraintName("fk_lecturers_user");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("projects_pkey");

            entity.HasIndex(e => e.CourseId, "idx_projects_course_id");

            entity.HasIndex(e => new { e.CourseId, e.Name }, "uq_projects_course_name").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'ACTIVE'::character varying");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Course).WithMany(p => p.Projects)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("fk_projects_course");
        });

        modelBuilder.Entity<ProjectDocument>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("project_documents_pkey");

            entity.HasIndex(e => new { e.ProjectId, e.DocType }, "idx_project_documents_project_doc_type");

            entity.HasIndex(e => e.SubmittedByUserId, "idx_project_documents_submitted_by");

            entity.HasIndex(e => new { e.ProjectId, e.DocType, e.VersionNo }, "uq_project_documents_version").IsUnique();

            entity.Property(e => e.DocType).HasMaxLength(50);
            entity.Property(e => e.FileUrl).HasMaxLength(1024);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'DRAFT'::character varying");
            entity.Property(e => e.SubmittedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Project).WithMany(p => p.ProjectDocuments)
                .HasForeignKey(d => d.ProjectId)
                .HasConstraintName("fk_project_documents_project");

            entity.HasOne(d => d.SubmittedByUser).WithMany(p => p.ProjectDocuments)
                .HasForeignKey(d => d.SubmittedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_project_documents_submitted_by");
        });

        modelBuilder.Entity<ProjectIntegration>(entity =>
        {
            entity.HasKey(e => e.ProjectId).HasName("project_integrations_pkey");

            entity.HasIndex(e => e.GithubRepoId, "uq_project_integrations_github_repo").IsUnique();

            entity.HasIndex(e => e.JiraProjectId, "uq_project_integrations_jira_project").IsUnique();

            entity.Property(e => e.ProjectId).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.GithubRepo).WithOne(p => p.ProjectIntegration)
                .HasForeignKey<ProjectIntegration>(d => d.GithubRepoId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_project_integrations_github_repo");

            entity.HasOne(d => d.JiraProject).WithOne(p => p.ProjectIntegration)
                .HasForeignKey<ProjectIntegration>(d => d.JiraProjectId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_project_integrations_jira_project");

            entity.HasOne(d => d.Project).WithOne(p => p.ProjectIntegration)
                .HasForeignKey<ProjectIntegration>(d => d.ProjectId)
                .HasConstraintName("fk_project_integrations_project");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("roles_pkey");

            entity.HasIndex(e => e.RoleName, "roles_role_name_key").IsUnique();

            entity.Property(e => e.RoleName).HasMaxLength(128);
        });

        modelBuilder.Entity<Semester>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("semesters_pkey");

            entity.HasIndex(e => e.Name, "semesters_name_key").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("students_pkey");

            entity.HasIndex(e => e.StudentCode, "students_student_code_key").IsUnique();

            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Department).HasMaxLength(255);
            entity.Property(e => e.Major).HasMaxLength(255);
            entity.Property(e => e.StudentCode).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.User).WithOne(p => p.Student)
                .HasForeignKey<Student>(d => d.UserId)
                .HasConstraintName("fk_students_user");
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("subjects_pkey");

            entity.HasIndex(e => e.SubjectCode, "subjects_subject_code_key").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.SubjectCode).HasMaxLength(50);
            entity.Property(e => e.SubjectName).HasMaxLength(255);
        });

        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("team_members_pkey");

            entity.HasIndex(e => new { e.ProjectId, e.TeamRole }, "idx_team_members_project_team_role");

            entity.HasIndex(e => e.StudentUserId, "idx_team_members_student_user_id");

            entity.HasIndex(e => new { e.ProjectId, e.StudentUserId }, "uq_team_members_project_student").IsUnique();

            entity.Property(e => e.ParticipationStatus)
                .HasMaxLength(50)
                .HasDefaultValueSql("'ACTIVE'::character varying");
            entity.Property(e => e.Responsibility).HasMaxLength(255);
            entity.Property(e => e.TeamRole)
                .HasMaxLength(50)
                .HasDefaultValueSql("'MEMBER'::character varying");

            entity.HasOne(d => d.Project).WithMany(p => p.TeamMembers)
                .HasForeignKey(d => d.ProjectId)
                .HasConstraintName("fk_team_members_project");

            entity.HasOne(d => d.StudentUser).WithMany(p => p.TeamMembers)
                .HasForeignKey(d => d.StudentUserId)
                .HasConstraintName("fk_team_members_student");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.Enabled).HasDefaultValue(true);
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.Password).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "user_role",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("role_id")
                        .OnDelete(DeleteBehavior.Restrict)
                        .HasConstraintName("fk_user_roles_role"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("user_id")
                        .HasConstraintName("fk_user_roles_user"),
                    j =>
                    {
                        j.HasKey("user_id", "role_id").HasName("user_roles_pkey");
                        j.ToTable("user_roles");
                        j.HasIndex(new[] { "role_id" }, "idx_user_roles_role_id");
                    });
        });

        modelBuilder.Entity<WorkLink>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("work_links_pkey");

            entity.HasIndex(e => e.JiraIssueId, "idx_work_links_issue_id");

            entity.HasIndex(e => e.RepoId, "idx_work_links_repo_id");

            entity.HasIndex(e => new { e.JiraIssueId, e.LinkType, e.CommitId, e.PrId, e.BranchId }, "uq_work_links_compound").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.LinkType).HasMaxLength(50);

            entity.HasOne(d => d.Branch).WithMany(p => p.WorkLinks)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_work_links_branch");

            entity.HasOne(d => d.Commit).WithMany(p => p.WorkLinks)
                .HasForeignKey(d => d.CommitId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_work_links_commit");

            entity.HasOne(d => d.JiraIssue).WithMany(p => p.WorkLinks)
                .HasForeignKey(d => d.JiraIssueId)
                .HasConstraintName("fk_work_links_issue");

            entity.HasOne(d => d.Pr).WithMany(p => p.WorkLinks)
                .HasForeignKey(d => d.PrId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_work_links_pr");

            entity.HasOne(d => d.Repo).WithMany(p => p.WorkLinks)
                .HasForeignKey(d => d.RepoId)
                .HasConstraintName("fk_work_links_repo");
        });

        modelBuilder.Entity<StudentActivityDaily>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("student_activity_dailies_pkey");

            entity.HasIndex(e => e.StudentUserId, "idx_student_activity_dailies_student");

            entity.HasIndex(e => e.ProjectId, "idx_student_activity_dailies_project");

            entity.HasIndex(e => e.ActivityDate, "idx_student_activity_dailies_date");

            entity.HasIndex(e => new { e.StudentUserId, e.ProjectId, e.ActivityDate }, "uq_student_activity_dailies_student_project_date").IsUnique();

            entity.Property(e => e.CommitsCount).HasDefaultValue(0);
            entity.Property(e => e.LinesAdded).HasDefaultValue(0);
            entity.Property(e => e.LinesDeleted).HasDefaultValue(0);
            entity.Property(e => e.PullRequestsCount).HasDefaultValue(0);
            entity.Property(e => e.CodeReviewsCount).HasDefaultValue(0);
            entity.Property(e => e.IssuesCreated).HasDefaultValue(0);
            entity.Property(e => e.IssuesCompleted).HasDefaultValue(0);
            entity.Property(e => e.StoryPoints).HasDefaultValue(0);
            entity.Property(e => e.TimeLoggedHours).HasPrecision(6, 2).HasDefaultValue(0);
            entity.Property(e => e.CommentsCount).HasDefaultValue(0);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Student).WithMany()
                .HasForeignKey(d => d.StudentUserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_student_activity_dailies_student");

            entity.HasOne(d => d.Project).WithMany()
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_student_activity_dailies_project");
        });

        modelBuilder.Entity<InactiveAlert>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("inactive_alerts_pkey");

            entity.HasIndex(e => e.AlertType, "idx_inactive_alerts_type");

            entity.HasIndex(e => new { e.TargetEntityType, e.TargetEntityId }, "idx_inactive_alerts_target");

            entity.HasIndex(e => e.ProjectId, "idx_inactive_alerts_project");

            entity.HasIndex(e => e.IsResolved, "idx_inactive_alerts_unresolved").HasFilter("IsResolved = false");

            entity.Property(e => e.AlertType).HasMaxLength(50);
            entity.Property(e => e.TargetEntityType).HasMaxLength(50);
            entity.Property(e => e.Severity).HasMaxLength(50).HasDefaultValueSql("'WARNING'::character varying");
            entity.Property(e => e.IsResolved).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Project).WithMany()
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_inactive_alerts_project");

            entity.HasOne(d => d.ResolvedByUser).WithMany()
                .HasForeignKey(d => d.ResolvedByUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_inactive_alerts_resolved_by");
        });

        modelBuilder.Entity<ReportExport>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("report_exports_pkey");

            entity.HasIndex(e => e.Status, "idx_report_exports_status");

            entity.HasIndex(e => e.RequestedByUserId, "idx_report_exports_requested_by");

            entity.HasIndex(e => new { e.Scope, e.ScopeEntityId }, "idx_report_exports_scope");

            entity.Property(e => e.ReportType).HasMaxLength(50);
            entity.Property(e => e.Scope).HasMaxLength(50);
            entity.Property(e => e.Format).HasMaxLength(10);
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValueSql("'PENDING'::character varying");
            entity.Property(e => e.FileUrl).HasMaxLength(1024);
            entity.Property(e => e.RequestedAt).HasDefaultValueSql("now()");

            entity.HasOne(d => d.RequestedByUser).WithMany()
                .HasForeignKey(d => d.RequestedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_report_exports_requested_by");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("audit_logs_pkey");

            entity.HasIndex(e => new { e.EntityType, e.EntityId }, "idx_audit_logs_entity");

            entity.HasIndex(e => e.PerformedByUserId, "idx_audit_logs_user");

            entity.HasIndex(e => e.Timestamp, "idx_audit_logs_timestamp");

            entity.Property(e => e.Action).HasMaxLength(100);
            entity.Property(e => e.EntityType).HasMaxLength(50);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.Timestamp).HasDefaultValueSql("now()");
            entity.Property(e => e.OldValues).HasColumnType("jsonb");
            entity.Property(e => e.NewValues).HasColumnType("jsonb");
            entity.Property(e => e.Metadata).HasColumnType("jsonb");

            entity.HasOne(d => d.PerformedByUser).WithMany()
                .HasForeignKey(d => d.PerformedByUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_audit_logs_performed_by");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.RecipientUser).WithMany()
                .HasForeignKey(d => d.RecipientUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            // 1. Global soft delete filter
            if (typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var body = Expression.Equal(
                    Expression.Property(parameter, nameof(ISoftDelete.IsDeleted)),
                    Expression.Constant(false));
                var filter = Expression.Lambda(body, parameter);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
            }

            // 2. Global snake_case naming convention
            entityType.SetTableName(ToSnakeCase(entityType.GetTableName() ?? ""));
            foreach (var property in entityType.GetProperties())
            {
                property.SetColumnName(ToSnakeCase(property.GetColumnName()));
            }

            foreach (var key in entityType.GetKeys())
            {
                key.SetName(ToSnakeCase(key.GetName() ?? ""));
            }

            foreach (var key in entityType.GetForeignKeys())
            {
                key.SetConstraintName(ToSnakeCase(key.GetConstraintName() ?? ""));
            }

            foreach (var index in entityType.GetIndexes())
            {
                index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName() ?? ""));
            }
        }

        // HACK for SQLite testing compatibility: Ignore PostgreSQL specific default SQL
        if (Database.ProviderName == "Microsoft.EntityFrameworkCore.Sqlite")
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    property.SetDefaultValueSql(null);
                }
            }
        }

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);

    private static string ToSnakeCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        var result = new System.Text.StringBuilder();
        for (int i = 0; i < input.Length; i++)
        {
            var c = input[i];
            if (char.IsUpper(c))
            {
                if (i > 0) result.Append('_');
                result.Append(char.ToLower(c));
            }
            else
            {
                result.Append(c);
            }
        }
        return result.ToString();
    }
}

