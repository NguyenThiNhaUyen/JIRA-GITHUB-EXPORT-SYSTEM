using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class JiraIssueLink
{
    public long Id { get; set; }

    public long ParentIssueId { get; set; }

    public long ChildIssueId { get; set; }

    public string LinkType { get; set; } = null!;

    public virtual JiraIssue ChildIssue { get; set; } = null!;

    public virtual JiraIssue ParentIssue { get; set; } = null!;
}
