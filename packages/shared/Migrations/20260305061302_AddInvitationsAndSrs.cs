using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace JiraGithubExport.Shared.Migrations
{
    /// <inheritdoc />
    public partial class AddInvitationsAndSrs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "feedback",
                table: "ProjectDocuments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "reviewed_at",
                table: "ProjectDocuments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "reviewer_user_id",
                table: "ProjectDocuments",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "reviewer_userid",
                table: "ProjectDocuments",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TeamInvitations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProjectId = table.Column<long>(type: "bigint", nullable: false),
                    InvitedByUserId = table.Column<long>(type: "bigint", nullable: false),
                    InvitedStudentUserId = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    message = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    projectid = table.Column<long>(type: "bigint", nullable: false),
                    invited_by_userid = table.Column<long>(type: "bigint", nullable: false),
                    invited_student_useruser_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_team_invitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_team_invitations_projects_projectid",
                        column: x => x.projectid,
                        principalTable: "Projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_team_invitations_students_invited_student_useruser_id",
                        column: x => x.invited_student_useruser_id,
                        principalTable: "Students",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_team_invitations_users_invited_by_userid",
                        column: x => x.invited_by_userid,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_project_documents_reviewer_userid",
                table: "ProjectDocuments",
                column: "reviewer_userid");

            migrationBuilder.CreateIndex(
                name: "IX_team_invitations_invited_by_userid",
                table: "TeamInvitations",
                column: "invited_by_userid");

            migrationBuilder.CreateIndex(
                name: "IX_team_invitations_invited_student_useruser_id",
                table: "TeamInvitations",
                column: "invited_student_useruser_id");

            migrationBuilder.CreateIndex(
                name: "IX_team_invitations_projectid",
                table: "TeamInvitations",
                column: "projectid");

            migrationBuilder.AddForeignKey(
                name: "FK_project_documents_users_reviewer_userid",
                table: "ProjectDocuments",
                column: "reviewer_userid",
                principalTable: "Users",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_project_documents_users_reviewer_userid",
                table: "ProjectDocuments");

            migrationBuilder.DropTable(
                name: "TeamInvitations");

            migrationBuilder.DropIndex(
                name: "IX_project_documents_reviewer_userid",
                table: "ProjectDocuments");

            migrationBuilder.DropColumn(
                name: "feedback",
                table: "ProjectDocuments");

            migrationBuilder.DropColumn(
                name: "reviewed_at",
                table: "ProjectDocuments");

            migrationBuilder.DropColumn(
                name: "reviewer_user_id",
                table: "ProjectDocuments");

            migrationBuilder.DropColumn(
                name: "reviewer_userid",
                table: "ProjectDocuments");
        }
    }
}

