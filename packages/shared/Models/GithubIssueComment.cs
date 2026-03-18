using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class GithubIssueComment
{
    public long Id { get; set; }

    public long IssueId { get; set; }

    public long? AuthorGithubUserId { get; set; }

    public string Body { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual GithubUser AuthorGithubUser { get; set; }

    public virtual GithubIssue Issue { get; set; } = null!;
}
