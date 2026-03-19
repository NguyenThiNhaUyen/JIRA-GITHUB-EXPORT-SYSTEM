using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JiraGithubExportSystem.Shared.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "password_reset_token",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "password_reset_token_expires_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "contribution_score",
                table: "team_members",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "max_students",
                table: "courses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "courses",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "password_reset_token",
                table: "users");

            migrationBuilder.DropColumn(
                name: "password_reset_token_expires_at",
                table: "users");

            migrationBuilder.DropColumn(
                name: "contribution_score",
                table: "team_members");

            migrationBuilder.DropColumn(
                name: "max_students",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "status",
                table: "courses");
        }
    }
}
