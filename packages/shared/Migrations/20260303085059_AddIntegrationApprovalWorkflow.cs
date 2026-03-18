using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JiraGithubExport.Shared.Migrations
{
    /// <inheritdoc />
    public partial class AddIntegrationApprovalWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "approval_status",
                table: "ProjectIntegrations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "approved_at",
                table: "ProjectIntegrations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "approved_by_user_id",
                table: "ProjectIntegrations",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "approved_byid",
                table: "ProjectIntegrations",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "rejected_reason",
                table: "ProjectIntegrations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "submitted_at",
                table: "ProjectIntegrations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "submitted_by_user_id",
                table: "ProjectIntegrations",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "submitted_byid",
                table: "ProjectIntegrations",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_project_integrations_approved_byid",
                table: "ProjectIntegrations",
                column: "approved_byid");

            migrationBuilder.CreateIndex(
                name: "IX_project_integrations_submitted_byid",
                table: "ProjectIntegrations",
                column: "submitted_byid");

            migrationBuilder.AddForeignKey(
                name: "FK_project_integrations_users_approved_byid",
                table: "ProjectIntegrations",
                column: "approved_byid",
                principalTable: "Users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_project_integrations_users_submitted_byid",
                table: "ProjectIntegrations",
                column: "submitted_byid",
                principalTable: "Users",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_project_integrations_users_approved_byid",
                table: "ProjectIntegrations");

            migrationBuilder.DropForeignKey(
                name: "FK_project_integrations_users_submitted_byid",
                table: "ProjectIntegrations");

            migrationBuilder.DropIndex(
                name: "IX_project_integrations_approved_byid",
                table: "ProjectIntegrations");

            migrationBuilder.DropIndex(
                name: "IX_project_integrations_submitted_byid",
                table: "ProjectIntegrations");

            migrationBuilder.DropColumn(
                name: "approval_status",
                table: "ProjectIntegrations");

            migrationBuilder.DropColumn(
                name: "approved_at",
                table: "ProjectIntegrations");

            migrationBuilder.DropColumn(
                name: "approved_by_user_id",
                table: "ProjectIntegrations");

            migrationBuilder.DropColumn(
                name: "approved_byid",
                table: "ProjectIntegrations");

            migrationBuilder.DropColumn(
                name: "rejected_reason",
                table: "ProjectIntegrations");

            migrationBuilder.DropColumn(
                name: "submitted_at",
                table: "ProjectIntegrations");

            migrationBuilder.DropColumn(
                name: "submitted_by_user_id",
                table: "ProjectIntegrations");

            migrationBuilder.DropColumn(
                name: "submitted_byid",
                table: "ProjectIntegrations");
        }
    }
}
