using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class JiraIssueComment
{
    public long Id { get; set; }

    public long IssueId { get; set; }

    public string AuthorJiraAccountId { get; set; } = null!;

    public string Body { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual JiraIssue Issue { get; set; } = null!;
}

