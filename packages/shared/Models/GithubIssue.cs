using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class GithubIssue
{
    public long Id { get; set; }

    public long RepoId { get; set; }

    public int IssueNumber { get; set; }

    public string Title { get; set; }

    public string Body { get; set; }

    public string State { get; set; }

    public long? AuthorGithubUserId { get; set; }

    public long? AssigneeGithubUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    public virtual GithubUser AssigneeGithubUser { get; set; }

    public virtual GithubUser AuthorGithubUser { get; set; }

    public virtual ICollection<GithubIssueComment> GithubIssueComments { get; set; } = new List<GithubIssueComment>();

    public virtual GithubRepository Repo { get; set; } = null!;
}

