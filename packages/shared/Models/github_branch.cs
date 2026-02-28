using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class github_branch
{
    public long id { get; set; }

    public long repo_id { get; set; }

    public string branch_name { get; set; } = null!;

    public bool is_default { get; set; }

    public string? head_commit_sha { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual github_repository repo { get; set; } = null!;

    public virtual ICollection<work_link> work_links { get; set; } = new List<work_link>();

    public virtual ICollection<github_commit> commits { get; set; } = new List<github_commit>();
}







