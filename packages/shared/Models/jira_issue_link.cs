using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class jira_issue_link
{
    public long id { get; set; }

    public long parent_issue_id { get; set; }

    public long child_issue_id { get; set; }

    public string link_type { get; set; } = null!;

    public virtual jira_issue child_issue { get; set; } = null!;

    public virtual jira_issue parent_issue { get; set; } = null!;
}







