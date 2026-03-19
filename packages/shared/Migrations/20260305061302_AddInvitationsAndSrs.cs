using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace JiraGithubExportSystem.Shared.Migrations
{
    /// <inheritdoc />
    public partial class AddInvitationsAndSrs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "feedback",
                table: "project_documents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "reviewed_at",
                table: "project_documents",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "reviewer_user_id",
                table: "project_documents",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "reviewer_userid",
                table: "project_documents",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "team_invitations",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    project_id = table.Column<long>(type: "bigint", nullable: false),
                    invited_by_user_id = table.Column<long>(type: "bigint", nullable: false),
                    invited_student_user_id = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    message = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    responded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    projectid = table.Column<long>(type: "bigint", nullable: false),
                    invited_by_userid = table.Column<long>(type: "bigint", nullable: false),
                    invited_student_useruser_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_team_invitations", x => x.id);
                    table.ForeignKey(
                        name: "FK_team_invitations_projects_projectid",
                        column: x => x.projectid,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_team_invitations_students_invited_student_useruser_id",
                        column: x => x.invited_student_useruser_id,
                        principalTable: "students",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_team_invitations_users_invited_by_userid",
                        column: x => x.invited_by_userid,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_project_documents_reviewer_userid",
                table: "project_documents",
                column: "reviewer_userid");

            migrationBuilder.CreateIndex(
                name: "IX_team_invitations_invited_by_userid",
                table: "team_invitations",
                column: "invited_by_userid");

            migrationBuilder.CreateIndex(
                name: "IX_team_invitations_invited_student_useruser_id",
                table: "team_invitations",
                column: "invited_student_useruser_id");

            migrationBuilder.CreateIndex(
                name: "IX_team_invitations_projectid",
                table: "team_invitations",
                column: "projectid");

            migrationBuilder.AddForeignKey(
                name: "FK_project_documents_users_reviewer_userid",
                table: "project_documents",
                column: "reviewer_userid",
                principalTable: "users",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_project_documents_users_reviewer_userid",
                table: "project_documents");

            migrationBuilder.DropTable(
                name: "team_invitations");

            migrationBuilder.DropIndex(
                name: "IX_project_documents_reviewer_userid",
                table: "project_documents");

            migrationBuilder.DropColumn(
                name: "feedback",
                table: "project_documents");

            migrationBuilder.DropColumn(
                name: "reviewed_at",
                table: "project_documents");

            migrationBuilder.DropColumn(
                name: "reviewer_user_id",
                table: "project_documents");

            migrationBuilder.DropColumn(
                name: "reviewer_userid",
                table: "project_documents");
        }
    }
}
