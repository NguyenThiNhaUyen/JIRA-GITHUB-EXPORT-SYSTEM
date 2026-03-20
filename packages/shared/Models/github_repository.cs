using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class github_repository
{
    public long id { get; set; }

    public long? github_repo_id { get; set; }

    public string owner_login { get; set; } = null!;

    public string name { get; set; } = null!;

    public string full_name { get; set; } = null!;

    public string? repo_url { get; set; }

    public string? visibility { get; set; }

    public string? default_branch { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual ICollection<github_branch> github_branches { get; set; } = new List<github_branch>();

    public virtual ICollection<github_commit> github_commits { get; set; } = new List<github_commit>();

    public virtual ICollection<github_issue> github_issues { get; set; } = new List<github_issue>();

    public virtual ICollection<github_pull_request> github_pull_requests { get; set; } = new List<github_pull_request>();

    public virtual project_integration? project_integration { get; set; }

    public virtual ICollection<work_link> work_links { get; set; } = new List<work_link>();
}







