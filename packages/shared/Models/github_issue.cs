using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class github_issue
{
    public long id { get; set; }

    public long repo_id { get; set; }

    public int issue_number { get; set; }

    public string? title { get; set; }

    public string? body { get; set; }

    public string? state { get; set; }

    public long? author_github_user_id { get; set; }

    public long? assignee_github_user_id { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public DateTime? closed_at { get; set; }

    public virtual github_user? assignee_github_user { get; set; }

    public virtual github_user? author_github_user { get; set; }

    public virtual ICollection<github_issue_comment> github_issue_comments { get; set; } = new List<github_issue_comment>();

    public virtual github_repository repo { get; set; } = null!;
}







