using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JiraGithubExport.Shared.Migrations
{
    /// <inheritdoc />
    public partial class AddPerProjectIntegrationTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "github_token",
                table: "project_integrations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "jira_token",
                table: "project_integrations",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "github_token",
                table: "project_integrations");

            migrationBuilder.DropColumn(
                name: "jira_token",
                table: "project_integrations");
        }
    }
}
