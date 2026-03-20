using System;

namespace JiraGithubExport.Shared.Models;

public partial class student_activity_daily
{
    public long id { get; set; }

    public long student_user_id { get; set; }

    public long project_id { get; set; }

    public DateOnly activity_date { get; set; }

    // GitHub metrics
    public int commits_count { get; set; }

    public int lines_added { get; set; }

    public int lines_deleted { get; set; }

    public int pull_requests_count { get; set; }

    public int code_reviews_count { get; set; }

    // Jira metrics
    public int issues_created { get; set; }

    public int issues_completed { get; set; }

    public int story_points { get; set; }

    public decimal time_logged_hours { get; set; }

    public int comments_count { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    // Navigation properties
    public virtual student student { get; set; } = null!;

    public virtual project project { get; set; } = null!;
}








