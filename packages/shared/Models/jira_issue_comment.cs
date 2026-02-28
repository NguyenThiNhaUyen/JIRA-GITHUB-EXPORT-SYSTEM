using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class jira_issue_comment
{
    public long id { get; set; }

    public long issue_id { get; set; }

    public string author_jira_account_id { get; set; } = null!;

    public string? body { get; set; }

    public DateTime created_at { get; set; }

    public virtual jira_issue issue { get; set; } = null!;
}







