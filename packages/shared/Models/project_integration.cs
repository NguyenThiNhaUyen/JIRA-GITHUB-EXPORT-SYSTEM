using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class project_integration
{
    public long project_id { get; set; }

    public long? jira_project_id { get; set; }

    public long? github_repo_id { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual github_repository? github_repo { get; set; }

    public virtual jira_project? jira_project { get; set; }

    public virtual project project { get; set; } = null!;
}








