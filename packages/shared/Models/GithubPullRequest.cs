using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class GithubPullRequest
{
    public long Id { get; set; }

    public long RepoId { get; set; }

    public int PrNumber { get; set; }

    public string Title { get; set; }

    public string Body { get; set; }

    public string State { get; set; }

    public long? AuthorGithubUserId { get; set; }

    public string SourceBranch { get; set; }

    public string TargetBranch { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    public DateTime? MergedAt { get; set; }

    public virtual GithubUser AuthorGithubUser { get; set; }

    public virtual GithubRepository Repo { get; set; } = null!;

    public virtual ICollection<WorkLink> WorkLinks { get; set; } = new List<WorkLink>();
}
