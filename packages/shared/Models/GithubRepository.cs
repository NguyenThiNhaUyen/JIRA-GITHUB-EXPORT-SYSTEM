using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class GithubRepository
{
    public long Id { get; set; }

    public long GithubRepoId { get; set; }

    public string OwnerLogin { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string RepoUrl { get; set; }

    public string Visibility { get; set; }

    public string DefaultBranch { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<GithubBranch> GithubBranches { get; set; } = new List<GithubBranch>();

    public virtual ICollection<GithubCommit> GithubCommits { get; set; } = new List<GithubCommit>();

    public virtual ICollection<GithubIssue> GithubIssues { get; set; } = new List<GithubIssue>();

    public virtual ICollection<GithubPullRequest> GithubPullRequests { get; set; } = new List<GithubPullRequest>();

    public virtual ProjectIntegration? ProjectIntegration { get; set; }

    public virtual ICollection<WorkLink> WorkLinks { get; set; } = new List<WorkLink>();
}
