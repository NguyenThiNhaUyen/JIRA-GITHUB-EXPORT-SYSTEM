using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class jira_issue
{
    public long id { get; set; }

    public string jira_issue_key { get; set; } = null!;

    public long jira_project_id { get; set; }

    public string? title { get; set; }

    public string? description { get; set; }

    public string? issue_type { get; set; }

    public string? status { get; set; }

    public string? priority { get; set; }

    public string? assignee_jira_account_id { get; set; }

    public string? reporter_jira_account_id { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual ICollection<jira_attachment> jira_attachments { get; set; } = new List<jira_attachment>();

    public virtual ICollection<jira_issue_comment> jira_issue_comments { get; set; } = new List<jira_issue_comment>();

    public virtual ICollection<jira_issue_link> jira_issue_linkchild_issues { get; set; } = new List<jira_issue_link>();

    public virtual ICollection<jira_issue_link> jira_issue_linkparent_issues { get; set; } = new List<jira_issue_link>();

    public virtual jira_project jira_project { get; set; } = null!;

    public virtual ICollection<jira_worklog> jira_worklogs { get; set; } = new List<jira_worklog>();

    public virtual ICollection<work_link> work_links { get; set; } = new List<work_link>();
}







