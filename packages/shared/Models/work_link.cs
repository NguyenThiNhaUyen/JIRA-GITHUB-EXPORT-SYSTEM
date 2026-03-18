using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class work_link
{
    public long id { get; set; }

    public long jira_issue_id { get; set; }

    public long repo_id { get; set; }

    public string link_type { get; set; } = null!;

    public long? commit_id { get; set; }

    public long? pr_id { get; set; }

    public long? branch_id { get; set; }

    public DateTime created_at { get; set; }

    public virtual github_branch? branch { get; set; }

    public virtual github_commit? commit { get; set; }

    public virtual jira_issue jira_issue { get; set; } = null!;

    public virtual github_pull_request? pr { get; set; }

    public virtual github_repository repo { get; set; } = null!;
}








