using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class jira_project
{
    public long id { get; set; }

    public string jira_project_key { get; set; } = null!;

    public string? jira_project_id { get; set; }

    public string project_name { get; set; } = null!;

    public string? jira_url { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual ICollection<jira_issue> jira_issues { get; set; } = new List<jira_issue>();

    public virtual project_integration? project_integration { get; set; }
}







