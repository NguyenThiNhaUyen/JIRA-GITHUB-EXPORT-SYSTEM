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
                name: "github_repositories",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    github_repo_id = table.Column<long>(type: "bigint", nullable: true),
                    owner_login = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    full_name = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    repo_url = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    visibility = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    default_branch = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_repositories_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "github_users",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    github_user_id = table.Column<long>(type: "bigint", nullable: true),
                    login = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    display_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    avatar_url = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    user_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_users_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "jira_projects",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    jira_project_key = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    jira_project_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    project_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    jira_url = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_projects_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_name = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("roles_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "semesters",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    start_date = table.Column<DateOnly>(type: "date", nullable: true),
                    end_date = table.Column<DateOnly>(type: "date", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("semesters_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "subjects",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    subject_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    subject_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("subjects_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    full_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    enabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("users_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "github_branches",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    repo_id = table.Column<long>(type: "bigint", nullable: false),
                    branch_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    head_commit_sha = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_branches_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_github_branches_repo",
                        column: x => x.repo_id,
                        principalTable: "github_repositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "github_commits",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    repo_id = table.Column<long>(type: "bigint", nullable: false),
                    commit_sha = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    message = table.Column<string>(type: "text", nullable: true),
                    author_github_user_id = table.Column<long>(type: "bigint", nullable: true),
                    committer_github_user_id = table.Column<long>(type: "bigint", nullable: true),
                    committed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    additions = table.Column<int>(type: "integer", nullable: true),
                    deletions = table.Column<int>(type: "integer", nullable: true),
                    changed_files = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_commits_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_github_commits_author",
                        column: x => x.author_github_user_id,
                        principalTable: "github_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_commits_committer",
                        column: x => x.committer_github_user_id,
                        principalTable: "github_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_commits_repo",
                        column: x => x.repo_id,
                        principalTable: "github_repositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "github_issues",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    repo_id = table.Column<long>(type: "bigint", nullable: false),
                    issue_number = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    body = table.Column<string>(type: "text", nullable: true),
                    state = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    author_github_user_id = table.Column<long>(type: "bigint", nullable: true),
                    assignee_github_user_id = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    closed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_issues_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_github_issues_assignee",
                        column: x => x.assignee_github_user_id,
                        principalTable: "github_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_issues_author",
                        column: x => x.author_github_user_id,
                        principalTable: "github_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_issues_repo",
                        column: x => x.repo_id,
                        principalTable: "github_repositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "github_pull_requests",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    repo_id = table.Column<long>(type: "bigint", nullable: false),
                    pr_number = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    body = table.Column<string>(type: "text", nullable: true),
                    state = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    author_github_user_id = table.Column<long>(type: "bigint", nullable: true),
                    source_branch = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    target_branch = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    closed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    merged_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_pull_requests_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_github_pull_requests_author",
                        column: x => x.author_github_user_id,
                        principalTable: "github_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_pull_requests_repo",
                        column: x => x.repo_id,
                        principalTable: "github_repositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "jira_issues",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    jira_issue_key = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    jira_project_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    issue_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    assignee_jira_account_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    reporter_jira_account_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_issues_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_jira_issues_project",
                        column: x => x.jira_project_id,
                        principalTable: "jira_projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entity_id = table.Column<long>(type: "bigint", nullable: false),
                    performed_by_user_id = table.Column<long>(type: "bigint", nullable: true),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    old_values = table.Column<string>(type: "jsonb", nullable: true),
                    new_values = table.Column<string>(type: "jsonb", nullable: true),
                    metadata = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("audit_logs_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_audit_logs_performed_by",
                        column: x => x.performed_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "courses",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    semester_id = table.Column<long>(type: "bigint", nullable: false),
                    subject_id = table.Column<long>(type: "bigint", nullable: false),
                    course_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    course_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_by_user_id = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("courses_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_courses_created_by",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_courses_semester",
                        column: x => x.semester_id,
                        principalTable: "semesters",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_courses_subject",
                        column: x => x.subject_id,
                        principalTable: "subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "external_accounts",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    external_user_key = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    username = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("external_accounts_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_external_accounts_user",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lecturers",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    lecturer_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    office_email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("lecturers_pkey", x => x.user_id);
                    table.ForeignKey(
                        name: "fk_lecturers_user",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "report_exports",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    report_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    scope = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    scope_entity_id = table.Column<long>(type: "bigint", nullable: false),
                    format = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'PENDING'::character varying"),
                    file_url = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: true),
                    requested_by_user_id = table.Column<long>(type: "bigint", nullable: false),
                    requested_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    error_message = table.Column<string>(type: "text", nullable: true),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("report_exports_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_report_exports_requested_by",
                        column: x => x.requested_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "students",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    student_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    major = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    intake_year = table.Column<int>(type: "integer", nullable: true),
                    department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("students_pkey", x => x.user_id);
                    table.ForeignKey(
                        name: "fk_students_user",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_roles",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    role_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("user_roles_pkey", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "fk_user_roles_role",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_user_roles_user",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "github_commit_branches",
                columns: table => new
                {
                    branch_id = table.Column<long>(type: "bigint", nullable: false),
                    commit_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_commit_branches_pkey", x => new { x.branch_id, x.commit_id });
                    table.ForeignKey(
                        name: "fk_github_commit_branches_branch",
                        column: x => x.branch_id,
                        principalTable: "github_branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_github_commit_branches_commit",
                        column: x => x.commit_id,
                        principalTable: "github_commits",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "github_issue_comments",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    issue_id = table.Column<long>(type: "bigint", nullable: false),
                    author_github_user_id = table.Column<long>(type: "bigint", nullable: true),
                    body = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("github_issue_comments_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_github_issue_comments_author",
                        column: x => x.author_github_user_id,
                        principalTable: "github_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_github_issue_comments_issue",
                        column: x => x.issue_id,
                        principalTable: "github_issues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "jira_attachments",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    issue_id = table.Column<long>(type: "bigint", nullable: false),
                    filename = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    url = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_attachments_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_jira_attachments_issue",
                        column: x => x.issue_id,
                        principalTable: "jira_issues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "jira_issue_comments",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    issue_id = table.Column<long>(type: "bigint", nullable: false),
                    author_jira_account_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    body = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_issue_comments_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_jira_issue_comments_issue",
                        column: x => x.issue_id,
                        principalTable: "jira_issues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "jira_issue_links",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    parent_issue_id = table.Column<long>(type: "bigint", nullable: false),
                    child_issue_id = table.Column<long>(type: "bigint", nullable: false),
                    link_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_issue_links_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_jira_issue_links_child",
                        column: x => x.child_issue_id,
                        principalTable: "jira_issues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_jira_issue_links_parent",
                        column: x => x.parent_issue_id,
                        principalTable: "jira_issues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "jira_worklogs",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    issue_id = table.Column<long>(type: "bigint", nullable: false),
                    author_jira_account_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    time_spent = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("jira_worklogs_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_jira_worklogs_issue",
                        column: x => x.issue_id,
                        principalTable: "jira_issues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "work_links",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    jira_issue_id = table.Column<long>(type: "bigint", nullable: false),
                    repo_id = table.Column<long>(type: "bigint", nullable: false),
                    link_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    commit_id = table.Column<long>(type: "bigint", nullable: true),
                    pr_id = table.Column<long>(type: "bigint", nullable: true),
                    branch_id = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("work_links_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_work_links_branch",
                        column: x => x.branch_id,
                        principalTable: "github_branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_work_links_commit",
                        column: x => x.commit_id,
                        principalTable: "github_commits",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_work_links_issue",
                        column: x => x.jira_issue_id,
                        principalTable: "jira_issues",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_work_links_pr",
                        column: x => x.pr_id,
                        principalTable: "github_pull_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_work_links_repo",
                        column: x => x.repo_id,
                        principalTable: "github_repositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "projects",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'ACTIVE'::character varying"),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("projects_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_projects_course",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "course_lecturers",
                columns: table => new
                {
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    lecturer_user_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("course_lecturers_pkey", x => new { x.course_id, x.lecturer_user_id });
                    table.ForeignKey(
                        name: "fk_course_lecturers_course",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_course_lecturers_lecturer",
                        column: x => x.lecturer_user_id,
                        principalTable: "lecturers",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "course_enrollments",
                columns: table => new
                {
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    student_user_id = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'ACTIVE'::character varying"),
                    enrolled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("course_enrollments_pkey", x => new { x.course_id, x.student_user_id });
                    table.ForeignKey(
                        name: "fk_course_enrollments_course",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_course_enrollments_student",
                        column: x => x.student_user_id,
                        principalTable: "students",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "inactive_alerts",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    alert_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    target_entity_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    target_entity_id = table.Column<long>(type: "bigint", nullable: false),
                    project_id = table.Column<long>(type: "bigint", nullable: true),
                    severity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'WARNING'::character varying"),
                    message = table.Column<string>(type: "text", nullable: false),
                    threshold_days = table.Column<int>(type: "integer", nullable: false),
                    last_activity_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_resolved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    resolved_by_user_id = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("inactive_alerts_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_inactive_alerts_project",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_inactive_alerts_resolved_by",
                        column: x => x.resolved_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "project_documents",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    project_id = table.Column<long>(type: "bigint", nullable: false),
                    doc_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'DRAFT'::character varying"),
                    file_url = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    submitted_by_user_id = table.Column<long>(type: "bigint", nullable: false),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("project_documents_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_project_documents_project",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_project_documents_submitted_by",
                        column: x => x.submitted_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "project_integrations",
                columns: table => new
                {
                    project_id = table.Column<long>(type: "bigint", nullable: false),
                    jira_project_id = table.Column<long>(type: "bigint", nullable: true),
                    github_repo_id = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("project_integrations_pkey", x => x.project_id);
                    table.ForeignKey(
                        name: "fk_project_integrations_github_repo",
                        column: x => x.github_repo_id,
                        principalTable: "github_repositories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_project_integrations_jira_project",
                        column: x => x.jira_project_id,
                        principalTable: "jira_projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_project_integrations_project",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "student_activity_dailies",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    student_user_id = table.Column<long>(type: "bigint", nullable: false),
                    project_id = table.Column<long>(type: "bigint", nullable: false),
                    activity_date = table.Column<DateOnly>(type: "date", nullable: false),
                    commits_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    lines_added = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    lines_deleted = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    pull_requests_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    code_reviews_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    issues_created = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    issues_completed = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    story_points = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    time_logged_hours = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false, defaultValue: 0m),
                    comments_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("student_activity_dailies_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_student_activity_dailies_project",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_student_activity_dailies_student",
                        column: x => x.student_user_id,
                        principalTable: "students",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "team_members",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    project_id = table.Column<long>(type: "bigint", nullable: false),
                    student_user_id = table.Column<long>(type: "bigint", nullable: false),
                    team_role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'MEMBER'::character varying"),
                    responsibility = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    participation_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValueSql: "'ACTIVE'::character varying"),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    left_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("team_members_pkey", x => x.id);
                    table.ForeignKey(
                        name: "fk_team_members_project",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_team_members_student",
                        column: x => x.student_user_id,
                        principalTable: "students",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_audit_logs_entity",
                table: "audit_logs",
                columns: new[] { "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "idx_audit_logs_timestamp",
                table: "audit_logs",
                column: "timestamp");

            migrationBuilder.CreateIndex(
                name: "idx_audit_logs_user",
                table: "audit_logs",
                column: "performed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_course_enrollments_course_status",
                table: "course_enrollments",
                columns: new[] { "course_id", "status" });

            migrationBuilder.CreateIndex(
                name: "idx_course_enrollments_student_user_id",
                table: "course_enrollments",
                column: "student_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_course_lecturers_lecturer_user_id",
                table: "course_lecturers",
                column: "lecturer_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_courses_semester_id",
                table: "courses",
                column: "semester_id");

            migrationBuilder.CreateIndex(
                name: "idx_courses_subject_id",
                table: "courses",
                column: "subject_id");

            migrationBuilder.CreateIndex(
                name: "IX_courses_created_by_user_id",
                table: "courses",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_courses_semester_subject_code",
                table: "courses",
                columns: new[] { "semester_id", "subject_id", "course_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_external_accounts_user_provider",
                table: "external_accounts",
                columns: new[] { "user_id", "provider" });

            migrationBuilder.CreateIndex(
                name: "uq_external_accounts_provider_key",
                table: "external_accounts",
                columns: new[] { "provider", "external_user_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_external_accounts_user_provider_key",
                table: "external_accounts",
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
                table: "github_commits",
                column: "author_github_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_github_commits_repo_committed_at",
                table: "github_commits",
                columns: new[] { "repo_id", "committed_at" });

            migrationBuilder.CreateIndex(
                name: "IX_github_commits_committer_github_user_id",
                table: "github_commits",
                column: "committer_github_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_github_commits_repo_sha",
                table: "github_commits",
                columns: new[] { "repo_id", "commit_sha" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_github_issue_comments_issue_created",
                table: "github_issue_comments",
                columns: new[] { "issue_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_github_issue_comments_author_github_user_id",
                table: "github_issue_comments",
                column: "author_github_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_github_issues_repo_state",
                table: "github_issues",
                columns: new[] { "repo_id", "state" });

            migrationBuilder.CreateIndex(
                name: "IX_github_issues_assignee_github_user_id",
                table: "github_issues",
                column: "assignee_github_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_github_issues_author_github_user_id",
                table: "github_issues",
                column: "author_github_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_github_issues_repo_number",
                table: "github_issues",
                columns: new[] { "repo_id", "issue_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_github_pull_requests_author",
                table: "github_pull_requests",
                column: "author_github_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_github_pull_requests_repo_state",
                table: "github_pull_requests",
                columns: new[] { "repo_id", "state" });

            migrationBuilder.CreateIndex(
                name: "uq_github_pull_requests_repo_number",
                table: "github_pull_requests",
                columns: new[] { "repo_id", "pr_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "github_repositories_full_name_key",
                table: "github_repositories",
                column: "full_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "github_repositories_github_repo_id_key",
                table: "github_repositories",
                column: "github_repo_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_github_repositories_owner_name",
                table: "github_repositories",
                columns: new[] { "owner_login", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "github_users_github_user_id_key",
                table: "github_users",
                column: "github_user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "github_users_login_key",
                table: "github_users",
                column: "login",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_inactive_alerts_project",
                table: "inactive_alerts",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "idx_inactive_alerts_target",
                table: "inactive_alerts",
                columns: new[] { "target_entity_type", "target_entity_id" });

            migrationBuilder.CreateIndex(
                name: "idx_inactive_alerts_type",
                table: "inactive_alerts",
                column: "alert_type");

            migrationBuilder.CreateIndex(
                name: "idx_inactive_alerts_unresolved",
                table: "inactive_alerts",
                column: "is_resolved",
                filter: "is_resolved = false");

            migrationBuilder.CreateIndex(
                name: "IX_inactive_alerts_resolved_by_user_id",
                table: "inactive_alerts",
                column: "resolved_by_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_jira_attachments_issue_uploaded",
                table: "jira_attachments",
                columns: new[] { "issue_id", "uploaded_at" });

            migrationBuilder.CreateIndex(
                name: "idx_jira_issue_comments_issue_created",
                table: "jira_issue_comments",
                columns: new[] { "issue_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "idx_jira_issue_links_child",
                table: "jira_issue_links",
                column: "child_issue_id");

            migrationBuilder.CreateIndex(
                name: "idx_jira_issue_links_parent",
                table: "jira_issue_links",
                column: "parent_issue_id");

            migrationBuilder.CreateIndex(
                name: "uq_jira_issue_links_parent_child_type",
                table: "jira_issue_links",
                columns: new[] { "parent_issue_id", "child_issue_id", "link_type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_jira_issues_project_id",
                table: "jira_issues",
                column: "jira_project_id");

            migrationBuilder.CreateIndex(
                name: "idx_jira_issues_project_status",
                table: "jira_issues",
                columns: new[] { "jira_project_id", "status" });

            migrationBuilder.CreateIndex(
                name: "jira_issues_jira_issue_key_key",
                table: "jira_issues",
                column: "jira_issue_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "jira_projects_jira_project_key_key",
                table: "jira_projects",
                column: "jira_project_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_jira_worklogs_issue_author",
                table: "jira_worklogs",
                columns: new[] { "issue_id", "author_jira_account_id" });

            migrationBuilder.CreateIndex(
                name: "lecturers_lecturer_code_key",
                table: "lecturers",
                column: "lecturer_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "lecturers_office_email_key",
                table: "lecturers",
                column: "office_email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_project_documents_project_doc_type",
                table: "project_documents",
                columns: new[] { "project_id", "doc_type" });

            migrationBuilder.CreateIndex(
                name: "idx_project_documents_submitted_by",
                table: "project_documents",
                column: "submitted_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_project_documents_version",
                table: "project_documents",
                columns: new[] { "project_id", "doc_type", "version_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_project_integrations_github_repo",
                table: "project_integrations",
                column: "github_repo_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_project_integrations_jira_project",
                table: "project_integrations",
                column: "jira_project_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_projects_course_id",
                table: "projects",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "uq_projects_course_name",
                table: "projects",
                columns: new[] { "course_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_report_exports_requested_by",
                table: "report_exports",
                column: "requested_by_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_report_exports_scope",
                table: "report_exports",
                columns: new[] { "scope", "scope_entity_id" });

            migrationBuilder.CreateIndex(
                name: "idx_report_exports_status",
                table: "report_exports",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "roles_role_name_key",
                table: "roles",
                column: "role_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "semesters_name_key",
                table: "semesters",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_student_activity_dailies_date",
                table: "student_activity_dailies",
                column: "activity_date");

            migrationBuilder.CreateIndex(
                name: "idx_student_activity_dailies_project",
                table: "student_activity_dailies",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "idx_student_activity_dailies_student",
                table: "student_activity_dailies",
                column: "student_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_student_activity_dailies_student_project_date",
                table: "student_activity_dailies",
                columns: new[] { "student_user_id", "project_id", "activity_date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "students_student_code_key",
                table: "students",
                column: "student_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "subjects_subject_code_key",
                table: "subjects",
                column: "subject_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_team_members_project_team_role",
                table: "team_members",
                columns: new[] { "project_id", "team_role" });

            migrationBuilder.CreateIndex(
                name: "idx_team_members_student_user_id",
                table: "team_members",
                column: "student_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_team_members_project_student",
                table: "team_members",
                columns: new[] { "project_id", "student_user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_user_roles_role_id",
                table: "user_roles",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "users_email_key",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_work_links_issue_id",
                table: "work_links",
                column: "jira_issue_id");

            migrationBuilder.CreateIndex(
                name: "idx_work_links_repo_id",
                table: "work_links",
                column: "repo_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_links_branch_id",
                table: "work_links",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_links_commit_id",
                table: "work_links",
                column: "commit_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_links_pr_id",
                table: "work_links",
                column: "pr_id");

            migrationBuilder.CreateIndex(
                name: "uq_work_links_compound",
                table: "work_links",
                columns: new[] { "jira_issue_id", "link_type", "commit_id", "pr_id", "branch_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "course_enrollments");

            migrationBuilder.DropTable(
                name: "course_lecturers");

            migrationBuilder.DropTable(
                name: "external_accounts");

            migrationBuilder.DropTable(
                name: "github_commit_branches");

            migrationBuilder.DropTable(
                name: "github_issue_comments");

            migrationBuilder.DropTable(
                name: "inactive_alerts");

            migrationBuilder.DropTable(
                name: "jira_attachments");

            migrationBuilder.DropTable(
                name: "jira_issue_comments");

            migrationBuilder.DropTable(
                name: "jira_issue_links");

            migrationBuilder.DropTable(
                name: "jira_worklogs");

            migrationBuilder.DropTable(
                name: "project_documents");

            migrationBuilder.DropTable(
                name: "project_integrations");

            migrationBuilder.DropTable(
                name: "report_exports");

            migrationBuilder.DropTable(
                name: "student_activity_dailies");

            migrationBuilder.DropTable(
                name: "team_members");

            migrationBuilder.DropTable(
                name: "user_roles");

            migrationBuilder.DropTable(
                name: "work_links");

            migrationBuilder.DropTable(
                name: "lecturers");

            migrationBuilder.DropTable(
                name: "github_issues");

            migrationBuilder.DropTable(
                name: "projects");

            migrationBuilder.DropTable(
                name: "students");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropTable(
                name: "github_branches");

            migrationBuilder.DropTable(
                name: "github_commits");

            migrationBuilder.DropTable(
                name: "jira_issues");

            migrationBuilder.DropTable(
                name: "github_pull_requests");

            migrationBuilder.DropTable(
                name: "courses");

            migrationBuilder.DropTable(
                name: "jira_projects");

            migrationBuilder.DropTable(
                name: "github_users");

            migrationBuilder.DropTable(
                name: "github_repositories");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "semesters");

            migrationBuilder.DropTable(
                name: "subjects");
        }
    }
}







