using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JiraGithubExportSystem.Shared.Migrations
{
    /// <inheritdoc />
    public partial class FixProjectIntegrationMappings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_project_integrations_users_approved_byid",
                table: "project_integrations");

            migrationBuilder.DropForeignKey(
                name: "FK_project_integrations_users_submitted_byid",
                table: "project_integrations");

            migrationBuilder.DropIndex(
                name: "IX_project_integrations_approved_byid",
                table: "project_integrations");

            migrationBuilder.DropIndex(
                name: "IX_project_integrations_submitted_byid",
                table: "project_integrations");

            migrationBuilder.DropColumn(
                name: "approved_byid",
                table: "project_integrations");

            migrationBuilder.DropColumn(
                name: "submitted_byid",
                table: "project_integrations");

            migrationBuilder.CreateIndex(
                name: "IX_project_integrations_approved_by_user_id",
                table: "project_integrations",
                column: "approved_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_project_integrations_submitted_by_user_id",
                table: "project_integrations",
                column: "submitted_by_user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_project_integrations_approved_by",
                table: "project_integrations",
                column: "approved_by_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_project_integrations_submitted_by",
                table: "project_integrations",
                column: "submitted_by_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_project_integrations_approved_by",
                table: "project_integrations");

            migrationBuilder.DropForeignKey(
                name: "fk_project_integrations_submitted_by",
                table: "project_integrations");

            migrationBuilder.DropIndex(
                name: "IX_project_integrations_approved_by_user_id",
                table: "project_integrations");

            migrationBuilder.DropIndex(
                name: "IX_project_integrations_submitted_by_user_id",
                table: "project_integrations");

            migrationBuilder.AddColumn<long>(
                name: "approved_byid",
                table: "project_integrations",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "submitted_byid",
                table: "project_integrations",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_project_integrations_approved_byid",
                table: "project_integrations",
                column: "approved_byid");

            migrationBuilder.CreateIndex(
                name: "IX_project_integrations_submitted_byid",
                table: "project_integrations",
                column: "submitted_byid");

            migrationBuilder.AddForeignKey(
                name: "FK_project_integrations_users_approved_byid",
                table: "project_integrations",
                column: "approved_byid",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_project_integrations_users_submitted_byid",
                table: "project_integrations",
                column: "submitted_byid",
                principalTable: "users",
                principalColumn: "id");
        }
    }
}
