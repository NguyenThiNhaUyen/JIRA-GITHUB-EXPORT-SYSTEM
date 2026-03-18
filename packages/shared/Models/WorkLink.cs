using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class WorkLink
{
    public long Id { get; set; }

    public long JiraIssueId { get; set; }

    public long RepoId { get; set; }

    public string LinkType { get; set; } = null!;

    public long CommitId { get; set; }

    public long PrId { get; set; }

    public long BranchId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual GithubBranch Branch { get; set; }

    public virtual GithubCommit Commit { get; set; }

    public virtual JiraIssue JiraIssue { get; set; } = null!;

    public virtual GithubPullRequest Pr { get; set; }

    public virtual GithubRepository Repo { get; set; } = null!;
}

