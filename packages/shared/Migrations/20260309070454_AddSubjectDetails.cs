using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JiraGithubExport.Shared.Migrations
{
    /// <inheritdoc />
    public partial class AddSubjectDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "credits",
                table: "subjects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "department",
                table: "subjects",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "subjects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "max_students",
                table: "subjects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "subjects",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "credits",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "department",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "description",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "max_students",
                table: "subjects");

            migrationBuilder.DropColumn(
                name: "status",
                table: "subjects");
        }
    }
}

