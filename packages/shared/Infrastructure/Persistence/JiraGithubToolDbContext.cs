using System;
using System.Collections.Generic;
using JiraGithubExport.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace JiraGithubExport.Shared.Infrastructure.Persistence;

public partial class JiraGithubToolDbContext : DbContext
{
    public JiraGithubToolDbContext(DbContextOptions<JiraGithubToolDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<course> courses { get; set; }

    public virtual DbSet<course_enrollment> course_enrollments { get; set; }

    public virtual DbSet<external_account> external_accounts { get; set; }

    public virtual DbSet<github_branch> github_branches { get; set; }

    public virtual DbSet<github_commit> github_commits { get; set; }

    public virtual DbSet<github_issue> github_issues { get; set; }

    public virtual DbSet<github_issue_comment> github_issue_comments { get; set; }

    public virtual DbSet<github_pull_request> github_pull_requests { get; set; }

    public virtual DbSet<github_repository> github_repositories { get; set; }

    public virtual DbSet<github_user> github_users { get; set; }

    public virtual DbSet<jira_attachment> jira_attachments { get; set; }

    public virtual DbSet<jira_issue> jira_issues { get; set; }

    public virtual DbSet<jira_issue_comment> jira_issue_comments { get; set; }

    public virtual DbSet<jira_issue_link> jira_issue_links { get; set; }

    public virtual DbSet<jira_project> jira_projects { get; set; }

    public virtual DbSet<jira_worklog> jira_worklogs { get; set; }

    public virtual DbSet<lecturer> lecturers { get; set; }

    public virtual DbSet<project> projects { get; set; }

    public virtual DbSet<project_document> project_documents { get; set; }

    public virtual DbSet<project_integration> project_integrations { get; set; }

    public virtual DbSet<role> roles { get; set; }

    public virtual DbSet<semester> semesters { get; set; }

    public virtual DbSet<student> students { get; set; }

    public virtual DbSet<subject> subjects { get; set; }

    public virtual DbSet<team_member> team_members { get; set; }

    public virtual DbSet<user> users { get; set; }

    public virtual DbSet<work_link> work_links { get; set; }

    // New entities for PBL features
    public virtual DbSet<student_activity_daily> student_activity_dailies { get; set; }

    public virtual DbSet<inactive_alert> inactive_alerts { get; set; }

    public virtual DbSet<report_export> report_exports { get; set; }

    public virtual DbSet<audit_log> audit_logs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<course>(entity =>
        {
            entity.HasKey(e => e.id).HasName("courses_pkey");

            entity.HasIndex(e => e.semester_id, "idx_courses_semester_id");

            entity.HasIndex(e => e.subject_id, "idx_courses_subject_id");

            entity.HasIndex(e => new { e.semester_id, e.subject_id, e.course_code }, "uq_courses_semester_subject_code").IsUnique();

            entity.Property(e => e.course_code).HasMaxLength(50);
            entity.Property(e => e.course_name).HasMaxLength(255);
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.created_by_user).WithMany(p => p.courses)
                .HasForeignKey(d => d.created_by_user_id)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_courses_created_by");

            entity.HasOne(d => d.semester).WithMany(p => p.courses)
                .HasForeignKey(d => d.semester_id)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_courses_semester");

            entity.HasOne(d => d.subject).WithMany(p => p.courses)
                .HasForeignKey(d => d.subject_id)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_courses_subject");

            entity.HasMany(d => d.lecturer_users).WithMany(p => p.courses)
                .UsingEntity<Dictionary<string, object>>(
                    "course_lecturer",
                    r => r.HasOne<lecturer>().WithMany()
                        .HasForeignKey("lecturer_user_id")
                        .HasConstraintName("fk_course_lecturers_lecturer"),
                    l => l.HasOne<course>().WithMany()
                        .HasForeignKey("course_id")
                        .HasConstraintName("fk_course_lecturers_course"),
                    j =>
                    {
                        j.HasKey("course_id", "lecturer_user_id").HasName("course_lecturers_pkey");
                        j.ToTable("course_lecturers");
                        j.HasIndex(new[] { "lecturer_user_id" }, "idx_course_lecturers_lecturer_user_id");
                    });
        });

        modelBuilder.Entity<course_enrollment>(entity =>
        {
            entity.HasKey(e => new { e.course_id, e.student_user_id }).HasName("course_enrollments_pkey");

            entity.HasIndex(e => new { e.course_id, e.status }, "idx_course_enrollments_course_status");

            entity.HasIndex(e => e.student_user_id, "idx_course_enrollments_student_user_id");

            entity.Property(e => e.enrolled_at).HasDefaultValueSql("now()");
            entity.Property(e => e.status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'ACTIVE'::character varying");

            entity.HasOne(d => d.course).WithMany(p => p.course_enrollments)
                .HasForeignKey(d => d.course_id)
                .HasConstraintName("fk_course_enrollments_course");

            entity.HasOne(d => d.student_user).WithMany(p => p.course_enrollments)
                .HasForeignKey(d => d.student_user_id)
                .HasConstraintName("fk_course_enrollments_student");
        });

        modelBuilder.Entity<external_account>(entity =>
        {
            entity.HasKey(e => e.id).HasName("external_accounts_pkey");

            entity.HasIndex(e => new { e.user_id, e.provider }, "idx_external_accounts_user_provider");

            entity.HasIndex(e => new { e.provider, e.external_user_key }, "uq_external_accounts_provider_key").IsUnique();

            entity.HasIndex(e => new { e.user_id, e.provider, e.external_user_key }, "uq_external_accounts_user_provider_key").IsUnique();

            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.external_user_key).HasMaxLength(255);
            entity.Property(e => e.provider).HasMaxLength(50);
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");
            entity.Property(e => e.username).HasMaxLength(255);

            entity.HasOne(d => d.user).WithMany(p => p.external_accounts)
                .HasForeignKey(d => d.user_id)
                .HasConstraintName("fk_external_accounts_user");
        });

        modelBuilder.Entity<github_branch>(entity =>
        {
            entity.HasKey(e => e.id).HasName("github_branches_pkey");

            entity.HasIndex(e => new { e.repo_id, e.branch_name }, "uq_github_branches_repo_branch").IsUnique();

            entity.Property(e => e.branch_name).HasMaxLength(255);
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.head_commit_sha).HasMaxLength(64);
            entity.Property(e => e.is_default).HasDefaultValue(false);
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.repo).WithMany(p => p.github_branches)
                .HasForeignKey(d => d.repo_id)
                .HasConstraintName("fk_github_branches_repo");

            entity.HasMany(d => d.commits).WithMany(p => p.branches)
                .UsingEntity<Dictionary<string, object>>(
                    "github_commit_branch",
                    r => r.HasOne<github_commit>().WithMany()
                        .HasForeignKey("commit_id")
                        .HasConstraintName("fk_github_commit_branches_commit"),
                    l => l.HasOne<github_branch>().WithMany()
                        .HasForeignKey("branch_id")
                        .HasConstraintName("fk_github_commit_branches_branch"),
                    j =>
                    {
                        j.HasKey("branch_id", "commit_id").HasName("github_commit_branches_pkey");
                        j.ToTable("github_commit_branches");
                    });
        });

        modelBuilder.Entity<github_commit>(entity =>
        {
            entity.HasKey(e => e.id).HasName("github_commits_pkey");

            entity.HasIndex(e => e.author_github_user_id, "idx_github_commits_author");

            entity.HasIndex(e => new { e.repo_id, e.committed_at }, "idx_github_commits_repo_committed_at");

            entity.HasIndex(e => new { e.repo_id, e.commit_sha }, "uq_github_commits_repo_sha").IsUnique();

            entity.Property(e => e.commit_sha).HasMaxLength(64);
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.author_github_user).WithMany(p => p.github_commitauthor_github_users)
                .HasForeignKey(d => d.author_github_user_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_commits_author");

            entity.HasOne(d => d.committer_github_user).WithMany(p => p.github_commitcommitter_github_users)
                .HasForeignKey(d => d.committer_github_user_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_commits_committer");

            entity.HasOne(d => d.repo).WithMany(p => p.github_commits)
                .HasForeignKey(d => d.repo_id)
                .HasConstraintName("fk_github_commits_repo");
        });

        modelBuilder.Entity<github_issue>(entity =>
        {
            entity.HasKey(e => e.id).HasName("github_issues_pkey");

            entity.HasIndex(e => new { e.repo_id, e.state }, "idx_github_issues_repo_state");

            entity.HasIndex(e => new { e.repo_id, e.issue_number }, "uq_github_issues_repo_number").IsUnique();

            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.state).HasMaxLength(50);
            entity.Property(e => e.title).HasMaxLength(512);
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.assignee_github_user).WithMany(p => p.github_issueassignee_github_users)
                .HasForeignKey(d => d.assignee_github_user_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_issues_assignee");

            entity.HasOne(d => d.author_github_user).WithMany(p => p.github_issueauthor_github_users)
                .HasForeignKey(d => d.author_github_user_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_issues_author");

            entity.HasOne(d => d.repo).WithMany(p => p.github_issues)
                .HasForeignKey(d => d.repo_id)
                .HasConstraintName("fk_github_issues_repo");
        });

        modelBuilder.Entity<github_issue_comment>(entity =>
        {
            entity.HasKey(e => e.id).HasName("github_issue_comments_pkey");

            entity.HasIndex(e => new { e.issue_id, e.created_at }, "idx_github_issue_comments_issue_created");

            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.author_github_user).WithMany(p => p.github_issue_comments)
                .HasForeignKey(d => d.author_github_user_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_issue_comments_author");

            entity.HasOne(d => d.issue).WithMany(p => p.github_issue_comments)
                .HasForeignKey(d => d.issue_id)
                .HasConstraintName("fk_github_issue_comments_issue");
        });

        modelBuilder.Entity<github_pull_request>(entity =>
        {
            entity.HasKey(e => e.id).HasName("github_pull_requests_pkey");

            entity.HasIndex(e => e.author_github_user_id, "idx_github_pull_requests_author");

            entity.HasIndex(e => new { e.repo_id, e.state }, "idx_github_pull_requests_repo_state");

            entity.HasIndex(e => new { e.repo_id, e.pr_number }, "uq_github_pull_requests_repo_number").IsUnique();

            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.source_branch).HasMaxLength(255);
            entity.Property(e => e.state).HasMaxLength(50);
            entity.Property(e => e.target_branch).HasMaxLength(255);
            entity.Property(e => e.title).HasMaxLength(512);
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.author_github_user).WithMany(p => p.github_pull_requests)
                .HasForeignKey(d => d.author_github_user_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_github_pull_requests_author");

            entity.HasOne(d => d.repo).WithMany(p => p.github_pull_requests)
                .HasForeignKey(d => d.repo_id)
                .HasConstraintName("fk_github_pull_requests_repo");
        });

        modelBuilder.Entity<github_repository>(entity =>
        {
            entity.HasKey(e => e.id).HasName("github_repositories_pkey");

            entity.HasIndex(e => e.full_name, "github_repositories_full_name_key").IsUnique();

            entity.HasIndex(e => e.github_repo_id, "github_repositories_github_repo_id_key").IsUnique();

            entity.HasIndex(e => new { e.owner_login, e.name }, "uq_github_repositories_owner_name").IsUnique();

            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.default_branch).HasMaxLength(255);
            entity.Property(e => e.full_name).HasMaxLength(512);
            entity.Property(e => e.name).HasMaxLength(255);
            entity.Property(e => e.owner_login).HasMaxLength(255);
            entity.Property(e => e.repo_url).HasMaxLength(512);
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");
            entity.Property(e => e.visibility).HasMaxLength(50);
        });

        modelBuilder.Entity<github_user>(entity =>
        {
            entity.HasKey(e => e.id).HasName("github_users_pkey");

            entity.HasIndex(e => e.github_user_id, "github_users_github_user_id_key").IsUnique();

            entity.HasIndex(e => e.login, "github_users_login_key").IsUnique();

            entity.Property(e => e.avatar_url).HasMaxLength(512);
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.display_name).HasMaxLength(255);
            entity.Property(e => e.email).HasMaxLength(255);
            entity.Property(e => e.login).HasMaxLength(255);
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");
            entity.Property(e => e.user_type).HasMaxLength(50);
        });

        modelBuilder.Entity<jira_attachment>(entity =>
        {
            entity.HasKey(e => e.id).HasName("jira_attachments_pkey");

            entity.HasIndex(e => new { e.issue_id, e.uploaded_at }, "idx_jira_attachments_issue_uploaded");

            entity.Property(e => e.filename).HasMaxLength(255);
            entity.Property(e => e.uploaded_at).HasDefaultValueSql("now()");
            entity.Property(e => e.url).HasMaxLength(1024);

            entity.HasOne(d => d.issue).WithMany(p => p.jira_attachments)
                .HasForeignKey(d => d.issue_id)
                .HasConstraintName("fk_jira_attachments_issue");
        });

        modelBuilder.Entity<jira_issue>(entity =>
        {
            entity.HasKey(e => e.id).HasName("jira_issues_pkey");

            entity.HasIndex(e => e.jira_project_id, "idx_jira_issues_project_id");

            entity.HasIndex(e => new { e.jira_project_id, e.status }, "idx_jira_issues_project_status");

            entity.HasIndex(e => e.jira_issue_key, "jira_issues_jira_issue_key_key").IsUnique();

            entity.Property(e => e.assignee_jira_account_id).HasMaxLength(255);
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.issue_type).HasMaxLength(50);
            entity.Property(e => e.jira_issue_key).HasMaxLength(50);
            entity.Property(e => e.priority).HasMaxLength(50);
            entity.Property(e => e.reporter_jira_account_id).HasMaxLength(255);
            entity.Property(e => e.status).HasMaxLength(50);
            entity.Property(e => e.title).HasMaxLength(255);
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.jira_project).WithMany(p => p.jira_issues)
                .HasForeignKey(d => d.jira_project_id)
                .HasConstraintName("fk_jira_issues_project");
        });

        modelBuilder.Entity<jira_issue_comment>(entity =>
        {
            entity.HasKey(e => e.id).HasName("jira_issue_comments_pkey");

            entity.HasIndex(e => new { e.issue_id, e.created_at }, "idx_jira_issue_comments_issue_created");

            entity.Property(e => e.author_jira_account_id).HasMaxLength(255);
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.issue).WithMany(p => p.jira_issue_comments)
                .HasForeignKey(d => d.issue_id)
                .HasConstraintName("fk_jira_issue_comments_issue");
        });

        modelBuilder.Entity<jira_issue_link>(entity =>
        {
            entity.HasKey(e => e.id).HasName("jira_issue_links_pkey");

            entity.HasIndex(e => e.child_issue_id, "idx_jira_issue_links_child");

            entity.HasIndex(e => e.parent_issue_id, "idx_jira_issue_links_parent");

            entity.HasIndex(e => new { e.parent_issue_id, e.child_issue_id, e.link_type }, "uq_jira_issue_links_parent_child_type").IsUnique();

            entity.Property(e => e.link_type).HasMaxLength(50);

            entity.HasOne(d => d.child_issue).WithMany(p => p.jira_issue_linkchild_issues)
                .HasForeignKey(d => d.child_issue_id)
                .HasConstraintName("fk_jira_issue_links_child");

            entity.HasOne(d => d.parent_issue).WithMany(p => p.jira_issue_linkparent_issues)
                .HasForeignKey(d => d.parent_issue_id)
                .HasConstraintName("fk_jira_issue_links_parent");
        });

        modelBuilder.Entity<jira_project>(entity =>
        {
            entity.HasKey(e => e.id).HasName("jira_projects_pkey");

            entity.HasIndex(e => e.jira_project_key, "jira_projects_jira_project_key_key").IsUnique();

            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.jira_project_id).HasMaxLength(100);
            entity.Property(e => e.jira_project_key).HasMaxLength(50);
            entity.Property(e => e.jira_url).HasMaxLength(512);
            entity.Property(e => e.project_name).HasMaxLength(255);
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<jira_worklog>(entity =>
        {
            entity.HasKey(e => e.id).HasName("jira_worklogs_pkey");

            entity.HasIndex(e => new { e.issue_id, e.author_jira_account_id }, "idx_jira_worklogs_issue_author");

            entity.Property(e => e.author_jira_account_id).HasMaxLength(255);
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.time_spent).HasPrecision(6, 2);

            entity.HasOne(d => d.issue).WithMany(p => p.jira_worklogs)
                .HasForeignKey(d => d.issue_id)
                .HasConstraintName("fk_jira_worklogs_issue");
        });

        modelBuilder.Entity<lecturer>(entity =>
        {
            entity.HasKey(e => e.user_id).HasName("lecturers_pkey");

            entity.HasIndex(e => e.lecturer_code, "lecturers_lecturer_code_key").IsUnique();

            entity.HasIndex(e => e.office_email, "lecturers_office_email_key").IsUnique();

            entity.Property(e => e.user_id).ValueGeneratedNever();
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.department).HasMaxLength(255);
            entity.Property(e => e.lecturer_code).HasMaxLength(50);
            entity.Property(e => e.office_email).HasMaxLength(255);
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.user).WithOne(p => p.lecturer)
                .HasForeignKey<lecturer>(d => d.user_id)
                .HasConstraintName("fk_lecturers_user");
        });

        modelBuilder.Entity<project>(entity =>
        {
            entity.HasKey(e => e.id).HasName("projects_pkey");

            entity.HasIndex(e => e.course_id, "idx_projects_course_id");

            entity.HasIndex(e => new { e.course_id, e.name }, "uq_projects_course_name").IsUnique();

            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.name).HasMaxLength(255);
            entity.Property(e => e.status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'ACTIVE'::character varying");
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.course).WithMany(p => p.projects)
                .HasForeignKey(d => d.course_id)
                .HasConstraintName("fk_projects_course");
        });

        modelBuilder.Entity<project_document>(entity =>
        {
            entity.HasKey(e => e.id).HasName("project_documents_pkey");

            entity.HasIndex(e => new { e.project_id, e.doc_type }, "idx_project_documents_project_doc_type");

            entity.HasIndex(e => e.submitted_by_user_id, "idx_project_documents_submitted_by");

            entity.HasIndex(e => new { e.project_id, e.doc_type, e.version_no }, "uq_project_documents_version").IsUnique();

            entity.Property(e => e.doc_type).HasMaxLength(50);
            entity.Property(e => e.file_url).HasMaxLength(1024);
            entity.Property(e => e.status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'DRAFT'::character varying");
            entity.Property(e => e.submitted_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.project).WithMany(p => p.project_documents)
                .HasForeignKey(d => d.project_id)
                .HasConstraintName("fk_project_documents_project");

            entity.HasOne(d => d.submitted_by_user).WithMany(p => p.project_documents)
                .HasForeignKey(d => d.submitted_by_user_id)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_project_documents_submitted_by");
        });

        modelBuilder.Entity<project_integration>(entity =>
        {
            entity.HasKey(e => e.project_id).HasName("project_integrations_pkey");

            entity.HasIndex(e => e.github_repo_id, "uq_project_integrations_github_repo").IsUnique();

            entity.HasIndex(e => e.jira_project_id, "uq_project_integrations_jira_project").IsUnique();

            entity.Property(e => e.project_id).ValueGeneratedNever();
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.github_repo).WithOne(p => p.project_integration)
                .HasForeignKey<project_integration>(d => d.github_repo_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_project_integrations_github_repo");

            entity.HasOne(d => d.jira_project).WithOne(p => p.project_integration)
                .HasForeignKey<project_integration>(d => d.jira_project_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_project_integrations_jira_project");

            entity.HasOne(d => d.project).WithOne(p => p.project_integration)
                .HasForeignKey<project_integration>(d => d.project_id)
                .HasConstraintName("fk_project_integrations_project");
        });

        modelBuilder.Entity<role>(entity =>
        {
            entity.HasKey(e => e.id).HasName("roles_pkey");

            entity.HasIndex(e => e.role_name, "roles_role_name_key").IsUnique();

            entity.Property(e => e.role_name).HasMaxLength(128);
        });

        modelBuilder.Entity<semester>(entity =>
        {
            entity.HasKey(e => e.id).HasName("semesters_pkey");

            entity.HasIndex(e => e.name, "semesters_name_key").IsUnique();

            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.name).HasMaxLength(50);
        });

        modelBuilder.Entity<student>(entity =>
        {
            entity.HasKey(e => e.user_id).HasName("students_pkey");

            entity.HasIndex(e => e.student_code, "students_student_code_key").IsUnique();

            entity.Property(e => e.user_id).ValueGeneratedNever();
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.department).HasMaxLength(255);
            entity.Property(e => e.major).HasMaxLength(255);
            entity.Property(e => e.student_code).HasMaxLength(50);
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.user).WithOne(p => p.student)
                .HasForeignKey<student>(d => d.user_id)
                .HasConstraintName("fk_students_user");
        });

        modelBuilder.Entity<subject>(entity =>
        {
            entity.HasKey(e => e.id).HasName("subjects_pkey");

            entity.HasIndex(e => e.subject_code, "subjects_subject_code_key").IsUnique();

            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.subject_code).HasMaxLength(50);
            entity.Property(e => e.subject_name).HasMaxLength(255);
        });

        modelBuilder.Entity<team_member>(entity =>
        {
            entity.HasKey(e => e.id).HasName("team_members_pkey");

            entity.HasIndex(e => new { e.project_id, e.team_role }, "idx_team_members_project_team_role");

            entity.HasIndex(e => e.student_user_id, "idx_team_members_student_user_id");

            entity.HasIndex(e => new { e.project_id, e.student_user_id }, "uq_team_members_project_student").IsUnique();

            entity.Property(e => e.participation_status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'ACTIVE'::character varying");
            entity.Property(e => e.responsibility).HasMaxLength(255);
            entity.Property(e => e.team_role)
                .HasMaxLength(50)
                .HasDefaultValueSql("'MEMBER'::character varying");

            entity.HasOne(d => d.project).WithMany(p => p.team_members)
                .HasForeignKey(d => d.project_id)
                .HasConstraintName("fk_team_members_project");

            entity.HasOne(d => d.student_user).WithMany(p => p.team_members)
                .HasForeignKey(d => d.student_user_id)
                .HasConstraintName("fk_team_members_student");
        });

        modelBuilder.Entity<user>(entity =>
        {
            entity.HasKey(e => e.id).HasName("users_pkey");

            entity.HasIndex(e => e.email, "users_email_key").IsUnique();

            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.email).HasMaxLength(255);
            entity.Property(e => e.enabled).HasDefaultValue(true);
            entity.Property(e => e.full_name).HasMaxLength(255);
            entity.Property(e => e.password).HasMaxLength(255);
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasMany(d => d.roles).WithMany(p => p.users)
                .UsingEntity<Dictionary<string, object>>(
                    "user_role",
                    r => r.HasOne<role>().WithMany()
                        .HasForeignKey("role_id")
                        .OnDelete(DeleteBehavior.Restrict)
                        .HasConstraintName("fk_user_roles_role"),
                    l => l.HasOne<user>().WithMany()
                        .HasForeignKey("user_id")
                        .HasConstraintName("fk_user_roles_user"),
                    j =>
                    {
                        j.HasKey("user_id", "role_id").HasName("user_roles_pkey");
                        j.ToTable("user_roles");
                        j.HasIndex(new[] { "role_id" }, "idx_user_roles_role_id");
                    });
        });

        modelBuilder.Entity<work_link>(entity =>
        {
            entity.HasKey(e => e.id).HasName("work_links_pkey");

            entity.HasIndex(e => e.jira_issue_id, "idx_work_links_issue_id");

            entity.HasIndex(e => e.repo_id, "idx_work_links_repo_id");

            entity.HasIndex(e => new { e.jira_issue_id, e.link_type, e.commit_id, e.pr_id, e.branch_id }, "uq_work_links_compound").IsUnique();

            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.link_type).HasMaxLength(50);

            entity.HasOne(d => d.branch).WithMany(p => p.work_links)
                .HasForeignKey(d => d.branch_id)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_work_links_branch");

            entity.HasOne(d => d.commit).WithMany(p => p.work_links)
                .HasForeignKey(d => d.commit_id)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_work_links_commit");

            entity.HasOne(d => d.jira_issue).WithMany(p => p.work_links)
                .HasForeignKey(d => d.jira_issue_id)
                .HasConstraintName("fk_work_links_issue");

            entity.HasOne(d => d.pr).WithMany(p => p.work_links)
                .HasForeignKey(d => d.pr_id)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_work_links_pr");

            entity.HasOne(d => d.repo).WithMany(p => p.work_links)
                .HasForeignKey(d => d.repo_id)
                .HasConstraintName("fk_work_links_repo");
        });

        modelBuilder.Entity<student_activity_daily>(entity =>
        {
            entity.HasKey(e => e.id).HasName("student_activity_dailies_pkey");

            entity.HasIndex(e => e.student_user_id, "idx_student_activity_dailies_student");

            entity.HasIndex(e => e.project_id, "idx_student_activity_dailies_project");

            entity.HasIndex(e => e.activity_date, "idx_student_activity_dailies_date");

            entity.HasIndex(e => new { e.student_user_id, e.project_id, e.activity_date }, "uq_student_activity_dailies_student_project_date").IsUnique();

            entity.Property(e => e.commits_count).HasDefaultValue(0);
            entity.Property(e => e.lines_added).HasDefaultValue(0);
            entity.Property(e => e.lines_deleted).HasDefaultValue(0);
            entity.Property(e => e.pull_requests_count).HasDefaultValue(0);
            entity.Property(e => e.code_reviews_count).HasDefaultValue(0);
            entity.Property(e => e.issues_created).HasDefaultValue(0);
            entity.Property(e => e.issues_completed).HasDefaultValue(0);
            entity.Property(e => e.story_points).HasDefaultValue(0);
            entity.Property(e => e.time_logged_hours).HasPrecision(6, 2).HasDefaultValue(0);
            entity.Property(e => e.comments_count).HasDefaultValue(0);
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");
            entity.Property(e => e.updated_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.student).WithMany()
                .HasForeignKey(d => d.student_user_id)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_student_activity_dailies_student");

            entity.HasOne(d => d.project).WithMany()
                .HasForeignKey(d => d.project_id)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_student_activity_dailies_project");
        });

        modelBuilder.Entity<inactive_alert>(entity =>
        {
            entity.HasKey(e => e.id).HasName("inactive_alerts_pkey");

            entity.HasIndex(e => e.alert_type, "idx_inactive_alerts_type");

            entity.HasIndex(e => new { e.target_entity_type, e.target_entity_id }, "idx_inactive_alerts_target");

            entity.HasIndex(e => e.project_id, "idx_inactive_alerts_project");

            entity.HasIndex(e => e.is_resolved, "idx_inactive_alerts_unresolved").HasFilter("is_resolved = false");

            entity.Property(e => e.alert_type).HasMaxLength(50);
            entity.Property(e => e.target_entity_type).HasMaxLength(50);
            entity.Property(e => e.severity).HasMaxLength(50).HasDefaultValueSql("'WARNING'::character varying");
            entity.Property(e => e.is_resolved).HasDefaultValue(false);
            entity.Property(e => e.created_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.project).WithMany()
                .HasForeignKey(d => d.project_id)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_inactive_alerts_project");

            entity.HasOne(d => d.resolved_by_user).WithMany()
                .HasForeignKey(d => d.resolved_by_user_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_inactive_alerts_resolved_by");
        });

        modelBuilder.Entity<report_export>(entity =>
        {
            entity.HasKey(e => e.id).HasName("report_exports_pkey");

            entity.HasIndex(e => e.status, "idx_report_exports_status");

            entity.HasIndex(e => e.requested_by_user_id, "idx_report_exports_requested_by");

            entity.HasIndex(e => new { e.scope, e.scope_entity_id }, "idx_report_exports_scope");

            entity.Property(e => e.report_type).HasMaxLength(50);
            entity.Property(e => e.scope).HasMaxLength(50);
            entity.Property(e => e.format).HasMaxLength(10);
            entity.Property(e => e.status).HasMaxLength(50).HasDefaultValueSql("'PENDING'::character varying");
            entity.Property(e => e.file_url).HasMaxLength(1024);
            entity.Property(e => e.requested_at).HasDefaultValueSql("now()");

            entity.HasOne(d => d.requested_by_user).WithMany()
                .HasForeignKey(d => d.requested_by_user_id)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_report_exports_requested_by");
        });

        modelBuilder.Entity<audit_log>(entity =>
        {
            entity.HasKey(e => e.id).HasName("audit_logs_pkey");

            entity.HasIndex(e => new { e.entity_type, e.entity_id }, "idx_audit_logs_entity");

            entity.HasIndex(e => e.performed_by_user_id, "idx_audit_logs_user");

            entity.HasIndex(e => e.timestamp, "idx_audit_logs_timestamp");

            entity.Property(e => e.action).HasMaxLength(100);
            entity.Property(e => e.entity_type).HasMaxLength(50);
            entity.Property(e => e.ip_address).HasMaxLength(45);
            entity.Property(e => e.timestamp).HasDefaultValueSql("now()");
            entity.Property(e => e.old_values).HasColumnType("jsonb");
            entity.Property(e => e.new_values).HasColumnType("jsonb");
            entity.Property(e => e.metadata).HasColumnType("jsonb");

            entity.HasOne(d => d.performed_by_user).WithMany()
                .HasForeignKey(d => d.performed_by_user_id)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_audit_logs_performed_by");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}







