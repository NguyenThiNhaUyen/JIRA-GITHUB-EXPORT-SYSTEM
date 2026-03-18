using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class JiraWorklog
{
    public long Id { get; set; }

    public long IssueId { get; set; }

    public string AuthorJiraAccountId { get; set; } = null!;

    public decimal TimeSpent { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual JiraIssue Issue { get; set; } = null!;
}
