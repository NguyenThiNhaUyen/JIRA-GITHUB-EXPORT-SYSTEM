using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class github_commit
{
    public long id { get; set; }

    public long repo_id { get; set; }

    public string commit_sha { get; set; } = null!;

    public string? message { get; set; }

    public long? author_github_user_id { get; set; }

    public long? committer_github_user_id { get; set; }

    public DateTime? committed_at { get; set; }

    public int? additions { get; set; }

    public int? deletions { get; set; }

    public int? changed_files { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual github_user? author_github_user { get; set; }

    public virtual github_user? committer_github_user { get; set; }

    public virtual github_repository repo { get; set; } = null!;

    public virtual ICollection<work_link> work_links { get; set; } = new List<work_link>();

    public virtual ICollection<github_branch> branches { get; set; } = new List<github_branch>();
}







