using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JiraGithubExport.Shared.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "password_reset_token",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "password_reset_token_expires_at",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "contribution_score",
                table: "TeamMembers",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "max_students",
                table: "Courses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "Courses",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "password_reset_token",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "password_reset_token_expires_at",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "contribution_score",
                table: "TeamMembers");

            migrationBuilder.DropColumn(
                name: "max_students",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "status",
                table: "Courses");
        }
    }
}

