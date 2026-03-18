using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class JiraIssue
{
    public long Id { get; set; }

    public string JiraIssueKey { get; set; } = null!;

    public long JiraProjectId { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }

    public string IssueType { get; set; }

    public string Status { get; set; }

    public string Priority { get; set; }

    public string AssigneeJiraAccountId { get; set; }

    public string ReporterJiraAccountId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<JiraAttachment> JiraAttachments { get; set; } = new List<JiraAttachment>();

    public virtual ICollection<JiraIssueComment> JiraIssueComments { get; set; } = new List<JiraIssueComment>();

    public virtual ICollection<JiraIssueLink> JiraIssueLinkchildIssues { get; set; } = new List<JiraIssueLink>();

    public virtual ICollection<JiraIssueLink> JiraIssueLinkparentIssues { get; set; } = new List<JiraIssueLink>();

    public virtual JiraProject JiraProject { get; set; } = null!;

    public virtual ICollection<JiraWorklog> JiraWorklogs { get; set; } = new List<JiraWorklog>();

    public virtual ICollection<WorkLink> WorkLinks { get; set; } = new List<WorkLink>();
}
