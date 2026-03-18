using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class GithubCommit
{
    public long Id { get; set; }

    public long RepoId { get; set; }

    public string CommitSha { get; set; } = null!;

    public string Message { get; set; }

    public long? AuthorGithubUserId { get; set; }

    public long? CommitterGithubUserId { get; set; }

    public DateTime? CommittedAt { get; set; }

    public int? Additions { get; set; }

    public int? Deletions { get; set; }

    public int? ChangedFiles { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual GithubUser AuthorGithubUser { get; set; }

    public virtual GithubUser CommitterGithubUser { get; set; }

    public virtual GithubRepository Repo { get; set; } = null!;

    public virtual ICollection<WorkLink> WorkLinks { get; set; } = new List<WorkLink>();

    public virtual ICollection<GithubBranch> Branches { get; set; } = new List<GithubBranch>();
}

