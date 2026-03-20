using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class github_user
{
    public long id { get; set; }

    public long? github_user_id { get; set; }

    public string login { get; set; } = null!;

    public string? display_name { get; set; }

    public string? email { get; set; }

    public string? avatar_url { get; set; }

    public string? user_type { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual ICollection<github_commit> github_commitauthor_github_users { get; set; } = new List<github_commit>();

    public virtual ICollection<github_commit> github_commitcommitter_github_users { get; set; } = new List<github_commit>();

    public virtual ICollection<github_issue_comment> github_issue_comments { get; set; } = new List<github_issue_comment>();

    public virtual ICollection<github_issue> github_issueassignee_github_users { get; set; } = new List<github_issue>();

    public virtual ICollection<github_issue> github_issueauthor_github_users { get; set; } = new List<github_issue>();

    public virtual ICollection<github_pull_request> github_pull_requests { get; set; } = new List<github_pull_request>();
}







