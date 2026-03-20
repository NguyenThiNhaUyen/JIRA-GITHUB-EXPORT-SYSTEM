using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class github_pull_request
{
    public long id { get; set; }

    public long repo_id { get; set; }

    public int pr_number { get; set; }

    public string? title { get; set; }

    public string? body { get; set; }

    public string? state { get; set; }

    public long? author_github_user_id { get; set; }

    public string? source_branch { get; set; }

    public string? target_branch { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public DateTime? closed_at { get; set; }

    public DateTime? merged_at { get; set; }

    public virtual github_user? author_github_user { get; set; }

    public virtual github_repository repo { get; set; } = null!;

    public virtual ICollection<work_link> work_links { get; set; } = new List<work_link>();
}







