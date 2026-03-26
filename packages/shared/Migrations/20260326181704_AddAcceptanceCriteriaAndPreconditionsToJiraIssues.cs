using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JiraGithubExport.Shared.Migrations
{
    /// <inheritdoc />
    public partial class AddAcceptanceCriteriaAndPreconditionsToJiraIssues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "acceptance_criteria",
                table: "jira_issues",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "preconditions",
                table: "jira_issues",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "acceptance_criteria",
                table: "jira_issues");

            migrationBuilder.DropColumn(
                name: "preconditions",
                table: "jira_issues");
        }
    }
}
