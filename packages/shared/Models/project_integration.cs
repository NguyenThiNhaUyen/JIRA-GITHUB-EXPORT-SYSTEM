using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class project_integration
{
    public long project_id { get; set; }

    public long? jira_project_id { get; set; }

    public long? github_repo_id { get; set; }

    public string? jira_token { get; set; }

    public string? github_token { get; set; }

    // Approval workflow
    public string approval_status { get; set; } = "PENDING"; // PENDING | APPROVED | REJECTED

    public long? submitted_by_user_id { get; set; }

    public DateTime? submitted_at { get; set; }

    public long? approved_by_user_id { get; set; }

    public DateTime? approved_at { get; set; }

    public string? rejected_reason { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    // Navigation properties
    public virtual github_repository? github_repo { get; set; }

    public virtual jira_project? jira_project { get; set; }

    public virtual project project { get; set; } = null!;

    public virtual user? submitted_by { get; set; }

    public virtual user? approved_by { get; set; }
}








