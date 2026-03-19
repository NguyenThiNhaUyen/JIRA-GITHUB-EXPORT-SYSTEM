using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JiraGithubExportSystem.Shared.Migrations
{
    /// <inheritdoc />
    public partial class CleanUpShadowProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_project_documents_users_reviewer_userid",
                table: "project_documents");

            migrationBuilder.DropForeignKey(
                name: "FK_team_invitations_projects_projectid",
                table: "team_invitations");

            migrationBuilder.DropForeignKey(
                name: "FK_team_invitations_students_invited_student_useruser_id",
                table: "team_invitations");

            migrationBuilder.DropForeignKey(
                name: "FK_team_invitations_users_invited_by_userid",
                table: "team_invitations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_team_invitations",
                table: "team_invitations");

            migrationBuilder.DropIndex(
                name: "IX_team_invitations_invited_by_userid",
                table: "team_invitations");

            migrationBuilder.DropIndex(
                name: "IX_team_invitations_invited_student_useruser_id",
                table: "team_invitations");

            migrationBuilder.DropIndex(
                name: "IX_team_invitations_projectid",
                table: "team_invitations");

            migrationBuilder.DropIndex(
                name: "IX_project_documents_reviewer_userid",
                table: "project_documents");

            migrationBuilder.DropColumn(
                name: "invited_by_userid",
                table: "team_invitations");

            migrationBuilder.DropColumn(
                name: "invited_student_useruser_id",
                table: "team_invitations");

            migrationBuilder.DropColumn(
                name: "projectid",
                table: "team_invitations");

            migrationBuilder.DropColumn(
                name: "reviewer_userid",
                table: "project_documents");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "team_invitations",
                type: "text",
                nullable: false,
                defaultValue: "PENDING",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "team_invitations",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddPrimaryKey(
                name: "team_invitations_pkey",
                table: "team_invitations",
                column: "id");

            migrationBuilder.CreateIndex(
                name: "IX_team_invitations_invited_by_user_id",
                table: "team_invitations",
                column: "invited_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_team_invitations_invited_student_user_id",
                table: "team_invitations",
                column: "invited_student_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_team_invitations_project_id",
                table: "team_invitations",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "IX_project_documents_reviewer_user_id",
                table: "project_documents",
                column: "reviewer_user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_project_documents_reviewer",
                table: "project_documents",
                column: "reviewer_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_team_invitations_invited_student",
                table: "team_invitations",
                column: "invited_student_user_id",
                principalTable: "students",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_team_invitations_inviter",
                table: "team_invitations",
                column: "invited_by_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_team_invitations_project",
                table: "team_invitations",
                column: "project_id",
                principalTable: "projects",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_project_documents_reviewer",
                table: "project_documents");

            migrationBuilder.DropForeignKey(
                name: "fk_team_invitations_invited_student",
                table: "team_invitations");

            migrationBuilder.DropForeignKey(
                name: "fk_team_invitations_inviter",
                table: "team_invitations");

            migrationBuilder.DropForeignKey(
                name: "fk_team_invitations_project",
                table: "team_invitations");

            migrationBuilder.DropPrimaryKey(
                name: "team_invitations_pkey",
                table: "team_invitations");

            migrationBuilder.DropIndex(
                name: "IX_team_invitations_invited_by_user_id",
                table: "team_invitations");

            migrationBuilder.DropIndex(
                name: "IX_team_invitations_invited_student_user_id",
                table: "team_invitations");

            migrationBuilder.DropIndex(
                name: "IX_team_invitations_project_id",
                table: "team_invitations");

            migrationBuilder.DropIndex(
                name: "IX_project_documents_reviewer_user_id",
                table: "project_documents");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "team_invitations",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldDefaultValue: "PENDING");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "team_invitations",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "now()");

            migrationBuilder.AddColumn<long>(
                name: "invited_by_userid",
                table: "team_invitations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "invited_student_useruser_id",
                table: "team_invitations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "projectid",
                table: "team_invitations",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "reviewer_userid",
                table: "project_documents",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_team_invitations",
                table: "team_invitations",
                column: "id");

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

            migrationBuilder.CreateIndex(
                name: "IX_project_documents_reviewer_userid",
                table: "project_documents",
                column: "reviewer_userid");

            migrationBuilder.AddForeignKey(
                name: "FK_project_documents_users_reviewer_userid",
                table: "project_documents",
                column: "reviewer_userid",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_team_invitations_projects_projectid",
                table: "team_invitations",
                column: "projectid",
                principalTable: "projects",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_team_invitations_students_invited_student_useruser_id",
                table: "team_invitations",
                column: "invited_student_useruser_id",
                principalTable: "students",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_team_invitations_users_invited_by_userid",
                table: "team_invitations",
                column: "invited_by_userid",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
