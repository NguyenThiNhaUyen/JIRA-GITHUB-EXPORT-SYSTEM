using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class github_issue_comment
{
    public long id { get; set; }

    public long issue_id { get; set; }

    public long? author_github_user_id { get; set; }

    public string? body { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual github_user? author_github_user { get; set; }

    public virtual github_issue issue { get; set; } = null!;
}







