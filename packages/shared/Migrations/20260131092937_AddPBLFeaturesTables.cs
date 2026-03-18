using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace JiraGithubExport.Shared.Migrations
{
    /// <inheritdoc />
    public partial class AddPBLFeaturesTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GithubRepositories",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GithubRepoId = table.Column<long>(type: "bigint", nullable: true),
                    OwnerLogin = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FullName = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    RepoUrl = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    visibility = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DefaultBranch = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_repositories_pkey", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GithubUsers",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GithubUserId = table.Column<long>(type: "bigint", nullable: true),
                    login = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AvatarUrl = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    UserType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_users_pkey", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JiraProjects",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JiraProjectKey = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    JiraProjectId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ProjectName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    JiraUrl = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_projects_pkey", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleName = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("roles_pkey", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Semesters",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("semesters_pkey", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Subjects",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SubjectCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SubjectName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("subjects_pkey", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FullName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("users_pkey", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "github_branches",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RepoId = table.Column<long>(type: "bigint", nullable: false),
                    BranchName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    HeadCommitSha = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_branches_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_github_branches_repo",
                        column: x => x.RepoId,
                        principalTable: "GithubRepositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GithubCommits",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RepoId = table.Column<long>(type: "bigint", nullable: false),
                    CommitSha = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    message = table.Column<string>(type: "text", nullable: true),
                    AuthorGithubUserId = table.Column<long>(type: "bigint", nullable: true),
                    CommitterGithubUserId = table.Column<long>(type: "bigint", nullable: true),
                    CommittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    additions = table.Column<int>(type: "integer", nullable: true),
                    deletions = table.Column<int>(type: "integer", nullable: true),
                    ChangedFiles = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_commits_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_github_commits_author",
                        column: x => x.AuthorGithubUserId,
                        principalTable: "GithubUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_commits_committer",
                        column: x => x.CommitterGithubUserId,
                        principalTable: "GithubUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_commits_repo",
                        column: x => x.RepoId,
                        principalTable: "GithubRepositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GithubIssues",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RepoId = table.Column<long>(type: "bigint", nullable: false),
                    IssueNumber = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    body = table.Column<string>(type: "text", nullable: true),
                    state = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AuthorGithubUserId = table.Column<long>(type: "bigint", nullable: true),
                    AssigneeGithubUserId = table.Column<long>(type: "bigint", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_issues_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_github_issues_assignee",
                        column: x => x.AssigneeGithubUserId,
                        principalTable: "GithubUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_issues_author",
                        column: x => x.AuthorGithubUserId,
                        principalTable: "GithubUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_issues_repo",
                        column: x => x.RepoId,
                        principalTable: "GithubRepositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GithubPullRequests",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RepoId = table.Column<long>(type: "bigint", nullable: false),
                    PrNumber = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    body = table.Column<string>(type: "text", nullable: true),
                    state = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AuthorGithubUserId = table.Column<long>(type: "bigint", nullable: true),
                    SourceBranch = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    TargetBranch = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MergedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_pull_requests_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_github_pull_requests_author",
                        column: x => x.AuthorGithubUserId,
                        principalTable: "GithubUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_pull_requests_repo",
                        column: x => x.RepoId,
                        principalTable: "GithubRepositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JiraIssues",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JiraIssueKey = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    JiraProjectId = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    IssueType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AssigneeJiraAccountId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ReporterJiraAccountId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_issues_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_jira_issues_project",
                        column: x => x.JiraProjectId,
                        principalTable: "JiraProjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EntityId = table.Column<long>(type: "bigint", nullable: false),
                    PerformedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "text", nullable: true),
                    OldValues = table.Column<string>(type: "jsonb", nullable: true),
                    NewValues = table.Column<string>(type: "jsonb", nullable: true),
                    metadata = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("audit_logs_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_audit_logs_performed_by",
                        column: x => x.PerformedByUserId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SemesterId = table.Column<long>(type: "bigint", nullable: false),
                    SubjectId = table.Column<long>(type: "bigint", nullable: false),
                    CourseCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CourseName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedByUserId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("courses_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_courses_created_by",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_courses_semester",
                        column: x => x.SemesterId,
                        principalTable: "Semesters",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_courses_subject",
                        column: x => x.SubjectId,
                        principalTable: "Subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExternalAccounts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ExternalUserKey = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    username = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("external_accounts_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_external_accounts_user",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Lecturers",
                columns: table => new
                {
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    LecturerCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    OfficeEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("lecturers_pkey", x => x.UserId);
                    table.ForeignKey(
                        name: "fk_lecturers_user",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReportExports",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReportType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    scope = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ScopeEntityId = table.Column<long>(type: "bigint", nullable: false),
                    format = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'PENDING'::character varying"),
                    FileUrl = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: true),
                    RequestedByUserId = table.Column<long>(type: "bigint", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("report_exports_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_report_exports_requested_by",
                        column: x => x.RequestedByUserId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Students",
                columns: table => new
                {
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    StudentCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    major = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IntakeYear = table.Column<int>(type: "integer", nullable: true),
                    department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("students_pkey", x => x.UserId);
                    table.ForeignKey(
                        name: "fk_students_user",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_roles",
                columns: table => new
                {
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    role_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("user_roles_pkey", x => new { x.UserId, x.role_id });
                    table.ForeignKey(
                        name: "fk_user_roles_role",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_user_roles_user",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "github_commit_branches",
                columns: table => new
                {
                    BranchId = table.Column<long>(type: "bigint", nullable: false),
                    CommitId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_commit_branches_pkey", x => new { x.BranchId, x.CommitId });
                    table.ForeignKey(
                        name: "fk_github_commit_branches_branch",
                        column: x => x.BranchId,
                        principalTable: "github_branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_github_commit_branches_commit",
                        column: x => x.CommitId,
                        principalTable: "GithubCommits",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GithubIssueComments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IssueId = table.Column<long>(type: "bigint", nullable: false),
                    AuthorGithubUserId = table.Column<long>(type: "bigint", nullable: true),
                    body = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_issue_comments_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_github_issue_comments_author",
                        column: x => x.AuthorGithubUserId,
                        principalTable: "GithubUsers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_issue_comments_issue",
                        column: x => x.IssueId,
                        principalTable: "GithubIssues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JiraAttachments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IssueId = table.Column<long>(type: "bigint", nullable: false),
                    filename = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    url = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_attachments_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_jira_attachments_issue",
                        column: x => x.IssueId,
                        principalTable: "JiraIssues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JiraIssueComments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IssueId = table.Column<long>(type: "bigint", nullable: false),
                    AuthorJiraAccountId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    body = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_issue_comments_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_jira_issue_comments_issue",
                        column: x => x.IssueId,
                        principalTable: "JiraIssues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JiraIssueLinks",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ParentIssueId = table.Column<long>(type: "bigint", nullable: false),
                    ChildIssueId = table.Column<long>(type: "bigint", nullable: false),
                    LinkType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_issue_links_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_jira_issue_links_child",
                        column: x => x.ChildIssueId,
                        principalTable: "JiraIssues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_jira_issue_links_parent",
                        column: x => x.ParentIssueId,
                        principalTable: "JiraIssues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JiraWorklogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IssueId = table.Column<long>(type: "bigint", nullable: false),
                    AuthorJiraAccountId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TimeSpent = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_worklogs_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_jira_worklogs_issue",
                        column: x => x.IssueId,
                        principalTable: "JiraIssues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkLinks",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JiraIssueId = table.Column<long>(type: "bigint", nullable: false),
                    RepoId = table.Column<long>(type: "bigint", nullable: false),
                    LinkType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CommitId = table.Column<long>(type: "bigint", nullable: true),
                    PrId = table.Column<long>(type: "bigint", nullable: true),
                    BranchId = table.Column<long>(type: "bigint", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("work_links_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_work_links_branch",
                        column: x => x.BranchId,
                        principalTable: "github_branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_work_links_commit",
                        column: x => x.CommitId,
                        principalTable: "GithubCommits",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_work_links_issue",
                        column: x => x.JiraIssueId,
                        principalTable: "JiraIssues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_work_links_pr",
                        column: x => x.PrId,
                        principalTable: "GithubPullRequests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_work_links_repo",
                        column: x => x.RepoId,
                        principalTable: "GithubRepositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'ACTIVE'::character varying"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("projects_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_projects_course",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "course_lecturers",
                columns: table => new
                {
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    LecturerUserId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("course_lecturers_pkey", x => new { x.CourseId, x.LecturerUserId });
                    table.ForeignKey(
                        name: "fk_course_lecturers_course",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_course_lecturers_lecturer",
                        column: x => x.LecturerUserId,
                        principalTable: "Lecturers",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CourseEnrollments",
                columns: table => new
                {
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    StudentUserId = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'ACTIVE'::character varying"),
                    EnrolledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("course_enrollments_pkey", x => new { x.CourseId, x.StudentUserId });
                    table.ForeignKey(
                        name: "fk_course_enrollments_course",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_course_enrollments_student",
                        column: x => x.StudentUserId,
                        principalTable: "Students",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InactiveAlerts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlertType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TargetEntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TargetEntityId = table.Column<long>(type: "bigint", nullable: false),
                    ProjectId = table.Column<long>(type: "bigint", nullable: true),
                    severity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'WARNING'::character varying"),
                    message = table.Column<string>(type: "text", nullable: false),
                    ThresholdDays = table.Column<int>(type: "integer", nullable: false),
                    LastActivityAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsResolved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolvedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("inactive_alerts_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_inactive_alerts_project",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_inactive_alerts_resolved_by",
                        column: x => x.ResolvedByUserId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ProjectDocuments",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProjectId = table.Column<long>(type: "bigint", nullable: false),
                    DocType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    VersionNo = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'DRAFT'::character varying"),
                    FileUrl = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    SubmittedByUserId = table.Column<long>(type: "bigint", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("project_documents_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_project_documents_project",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_project_documents_submitted_by",
                        column: x => x.SubmittedByUserId,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProjectIntegrations",
                columns: table => new
                {
                    ProjectId = table.Column<long>(type: "bigint", nullable: false),
                    JiraProjectId = table.Column<long>(type: "bigint", nullable: true),
                    GithubRepoId = table.Column<long>(type: "bigint", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("project_integrations_pkey", x => x.ProjectId);
                    table.ForeignKey(
                        name: "fk_project_integrations_github_repo",
                        column: x => x.GithubRepoId,
                        principalTable: "GithubRepositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_project_integrations_jira_project",
                        column: x => x.JiraProjectId,
                        principalTable: "JiraProjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_project_integrations_project",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentActivityDailies",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentUserId = table.Column<long>(type: "bigint", nullable: false),
                    ProjectId = table.Column<long>(type: "bigint", nullable: false),
                    ActivityDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CommitsCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    LinesAdded = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    LinesDeleted = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    PullRequestsCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CodeReviewsCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IssuesCreated = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IssuesCompleted = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    StoryPoints = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    TimeLoggedHours = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false, defaultValue: 0m),
                    CommentsCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("student_activity_dailies_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_student_activity_dailies_project",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_activity_dailies_student",
                        column: x => x.StudentUserId,
                        principalTable: "Students",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeamMembers",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProjectId = table.Column<long>(type: "bigint", nullable: false),
                    StudentUserId = table.Column<long>(type: "bigint", nullable: false),
                    TeamRole = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'MEMBER'::character varying"),
                    responsibility = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ParticipationStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'ACTIVE'::character varying"),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LeftAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("team_members_pkey", x => x.Id);
                    table.ForeignKey(
                        name: "fk_team_members_project",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_team_members_student",
                        column: x => x.StudentUserId,
                        principalTable: "Students",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_audit_logs_entity",
                table: "AuditLogs",
                columns: new[] { "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "idx_audit_logs_timestamp",
                table: "AuditLogs",
                column: "timestamp");

            migrationBuilder.CreateIndex(
                name: "idx_audit_logs_user",
                table: "AuditLogs",
                column: "performed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_course_enrollments_course_status",
                table: "CourseEnrollments",
                columns: new[] { "course_id", "status" });

            migrationBuilder.CreateIndex(
                name: "idx_course_enrollments_student_user_id",
                table: "CourseEnrollments",
                column: "student_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_course_lecturers_lecturer_user_id",
                table: "course_lecturers",
                column: "lecturer_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_courses_semester_id",
                table: "Courses",
                column: "semester_id");

            migrationBuilder.CreateIndex(
                name: "idx_courses_subject_id",
                table: "Courses",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "IX_courses_created_by_user_id",
                table: "Courses",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_courses_semester_subject_code",
                table: "Courses",
                columns: new[] { "semester_id", "subject_id", "course_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_external_accounts_user_provider",
                table: "ExternalAccounts",
                columns: new[] { "user_id", "provider" });

            migrationBuilder.CreateIndex(
                name: "uq_external_accounts_provider_key",
                table: "ExternalAccounts",
                columns: new[] { "provider", "external_user_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_external_accounts_user_provider_key",
                table: "ExternalAccounts",
                columns: new[] { "user_id", "provider", "external_user_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_github_branches_repo_branch",
                table: "github_branches",
                columns: new[] { "repo_id", "branch_name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_github_commit_branches_commit_id",
                table: "github_commit_branches",
                column: "commit_id");

            migrationBuilder.CreateIndex(
                name: "idx_github_commits_author",
                table: "GithubCommits",
                column: "author_github_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_github_commits_repo_committed_at",
                table: "GithubCommits",
                columns: new[] { "repo_id", "committed_at" });

            migrationBuilder.CreateIndex(
                name: "IX_github_commits_committer_github_user_id",
                table: "GithubCommits",
                column: "committer_github_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_github_commits_repo_sha",
                table: "GithubCommits",
                columns: new[] { "repo_id", "commit_sha" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_github_issue_comments_issue_created",
                table: "GithubIssueComments",
                columns: new[] { "issue_id", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_github_issue_comments_author_github_user_id",
                table: "GithubIssueComments",
                column: "author_github_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_github_issues_repo_state",
                table: "GithubIssues",
                columns: new[] { "repo_id", "state" });

            migrationBuilder.CreateIndex(
                name: "IX_github_issues_assignee_github_user_id",
                table: "GithubIssues",
                column: "assignee_github_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_github_issues_author_github_user_id",
                table: "GithubIssues",
                column: "author_github_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_github_issues_repo_number",
                table: "GithubIssues",
                columns: new[] { "repo_id", "issue_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_github_pull_requests_author",
                table: "GithubPullRequests",
                column: "author_github_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_github_pull_requests_repo_state",
                table: "GithubPullRequests",
                columns: new[] { "repo_id", "state" });

            migrationBuilder.CreateIndex(
                name: "uq_github_pull_requests_repo_number",
                table: "GithubPullRequests",
                columns: new[] { "repo_id", "pr_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "github_repositories_full_name_key",
                table: "GithubRepositories",
                column: "FullName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "github_repositories_github_repo_id_key",
                table: "GithubRepositories",
                column: "github_repo_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_github_repositories_owner_name",
                table: "GithubRepositories",
                columns: new[] { "owner_login", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "github_users_github_user_id_key",
                table: "GithubUsers",
                column: "github_user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "github_users_login_key",
                table: "GithubUsers",
                column: "login",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_inactive_alerts_project",
                table: "InactiveAlerts",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "idx_inactive_alerts_target",
                table: "InactiveAlerts",
                columns: new[] { "target_entity_type", "target_entity_id" });

            migrationBuilder.CreateIndex(
                name: "idx_inactive_alerts_type",
                table: "InactiveAlerts",
                column: "alert_type");

            migrationBuilder.CreateIndex(
                name: "idx_inactive_alerts_unresolved",
                table: "InactiveAlerts",
                column: "is_resolved",
                filter: "IsResolved = false");

            migrationBuilder.CreateIndex(
                name: "IX_inactive_alerts_resolved_by_user_id",
                table: "InactiveAlerts",
                column: "resolved_by_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_jira_attachments_issue_uploaded",
                table: "JiraAttachments",
                columns: new[] { "issue_id", "uploaded_at" });

            migrationBuilder.CreateIndex(
                name: "idx_jira_issue_comments_issue_created",
                table: "JiraIssueComments",
                columns: new[] { "issue_id", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "idx_jira_issue_links_child",
                table: "JiraIssueLinks",
                column: "child_issue_id");

            migrationBuilder.CreateIndex(
                name: "idx_jira_issue_links_parent",
                table: "JiraIssueLinks",
                column: "parent_issue_id");

            migrationBuilder.CreateIndex(
                name: "uq_jira_issue_links_parent_child_type",
                table: "JiraIssueLinks",
                columns: new[] { "parent_issue_id", "child_issue_id", "link_type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_jira_issues_project_id",
                table: "JiraIssues",
                column: "jira_project_id");

            migrationBuilder.CreateIndex(
                name: "idx_jira_issues_project_status",
                table: "JiraIssues",
                columns: new[] { "jira_project_id", "status" });

            migrationBuilder.CreateIndex(
                name: "jira_issues_jira_issue_key_key",
                table: "JiraIssues",
                column: "jira_issue_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "jira_projects_jira_project_key_key",
                table: "JiraProjects",
                column: "jira_project_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_jira_worklogs_issue_author",
                table: "JiraWorklogs",
                columns: new[] { "issue_id", "author_jira_account_id" });

            migrationBuilder.CreateIndex(
                name: "lecturers_lecturer_code_key",
                table: "Lecturers",
                column: "lecturer_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "lecturers_office_email_key",
                table: "Lecturers",
                column: "office_email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_project_documents_project_doc_type",
                table: "ProjectDocuments",
                columns: new[] { "project_id", "doc_type" });

            migrationBuilder.CreateIndex(
                name: "idx_project_documents_submitted_by",
                table: "ProjectDocuments",
                column: "submitted_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_project_documents_version",
                table: "ProjectDocuments",
                columns: new[] { "project_id", "doc_type", "version_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_project_integrations_github_repo",
                table: "ProjectIntegrations",
                column: "github_repo_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_project_integrations_jira_project",
                table: "ProjectIntegrations",
                column: "jira_project_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_projects_course_id",
                table: "Projects",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "uq_projects_course_name",
                table: "Projects",
                columns: new[] { "course_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_report_exports_requested_by",
                table: "ReportExports",
                column: "requested_by_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_report_exports_scope",
                table: "ReportExports",
                columns: new[] { "scope", "scope_entity_id" });

            migrationBuilder.CreateIndex(
                name: "idx_report_exports_status",
                table: "ReportExports",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "roles_role_name_key",
                table: "Roles",
                column: "role_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "semesters_name_key",
                table: "Semesters",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_student_activity_dailies_date",
                table: "StudentActivityDailies",
                column: "activity_date");

            migrationBuilder.CreateIndex(
                name: "idx_student_activity_dailies_project",
                table: "StudentActivityDailies",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "idx_student_activity_dailies_student",
                table: "StudentActivityDailies",
                column: "student_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_student_activity_dailies_student_project_date",
                table: "StudentActivityDailies",
                columns: new[] { "student_user_id", "project_id", "activity_date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "students_student_code_key",
                table: "Students",
                column: "student_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "subjects_subject_code_key",
                table: "Subjects",
                column: "subject_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_team_members_project_team_role",
                table: "TeamMembers",
                columns: new[] { "project_id", "team_role" });

            migrationBuilder.CreateIndex(
                name: "idx_team_members_student_user_id",
                table: "TeamMembers",
                column: "student_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_team_members_project_student",
                table: "TeamMembers",
                columns: new[] { "project_id", "student_user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_user_roles_role_id",
                table: "user_roles",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "users_email_key",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_work_links_issue_id",
                table: "WorkLinks",
                column: "jira_issue_id");

            migrationBuilder.CreateIndex(
                name: "idx_work_links_repo_id",
                table: "WorkLinks",
                column: "repo_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_links_branch_id",
                table: "WorkLinks",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_links_commit_id",
                table: "WorkLinks",
                column: "commit_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_links_pr_id",
                table: "WorkLinks",
                column: "pr_id");

            migrationBuilder.CreateIndex(
                name: "uq_work_links_compound",
                table: "WorkLinks",
                columns: new[] { "jira_issue_id", "link_type", "commit_id", "pr_id", "branch_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "CourseEnrollments");

            migrationBuilder.DropTable(
                name: "course_lecturers");

            migrationBuilder.DropTable(
                name: "ExternalAccounts");

            migrationBuilder.DropTable(
                name: "github_commit_branches");

            migrationBuilder.DropTable(
                name: "GithubIssueComments");

            migrationBuilder.DropTable(
                name: "InactiveAlerts");

            migrationBuilder.DropTable(
                name: "JiraAttachments");

            migrationBuilder.DropTable(
                name: "JiraIssueComments");

            migrationBuilder.DropTable(
                name: "JiraIssueLinks");

            migrationBuilder.DropTable(
                name: "JiraWorklogs");

            migrationBuilder.DropTable(
                name: "ProjectDocuments");

            migrationBuilder.DropTable(
                name: "ProjectIntegrations");

            migrationBuilder.DropTable(
                name: "ReportExports");

            migrationBuilder.DropTable(
                name: "StudentActivityDailies");

            migrationBuilder.DropTable(
                name: "TeamMembers");

            migrationBuilder.DropTable(
                name: "user_roles");

            migrationBuilder.DropTable(
                name: "WorkLinks");

            migrationBuilder.DropTable(
                name: "Lecturers");

            migrationBuilder.DropTable(
                name: "GithubIssues");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Students");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "github_branches");

            migrationBuilder.DropTable(
                name: "GithubCommits");

            migrationBuilder.DropTable(
                name: "JiraIssues");

            migrationBuilder.DropTable(
                name: "GithubPullRequests");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "JiraProjects");

            migrationBuilder.DropTable(
                name: "GithubUsers");

            migrationBuilder.DropTable(
                name: "GithubRepositories");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Semesters");

            migrationBuilder.DropTable(
                name: "Subjects");
        }
    }
}
