using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class GithubBranch
{
    public long Id { get; set; }

    public long RepoId { get; set; }

    public string BranchName { get; set; } = null!;

    public bool IsDefault { get; set; }

    public string HeadCommitSha { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual GithubRepository Repo { get; set; } = null!;

    public virtual ICollection<WorkLink> WorkLinks { get; set; } = new List<WorkLink>();

    public virtual ICollection<GithubCommit> Commits { get; set; } = new List<GithubCommit>();
}
