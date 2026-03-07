using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class jira_attachment
{
    public long id { get; set; }

    public long issue_id { get; set; }

    public string filename { get; set; } = null!;

    public string url { get; set; } = null!;

    public DateTime uploaded_at { get; set; }

    public virtual jira_issue issue { get; set; } = null!;
}







