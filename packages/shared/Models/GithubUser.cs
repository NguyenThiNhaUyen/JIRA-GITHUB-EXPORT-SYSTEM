using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class GithubUser
{
    public long Id { get; set; }

    public long GithubUserId { get; set; }

    public string Login { get; set; } = null!;

    public string DisplayName { get; set; }

    public string Email { get; set; }

    public string AvatarUrl { get; set; }

    public string UserType { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<GithubCommit> GithubCommitauthorGithubUsers { get; set; } = new List<GithubCommit>();

    public virtual ICollection<GithubCommit> GithubCommitcommitterGithubUsers { get; set; } = new List<GithubCommit>();

    public virtual ICollection<GithubIssueComment> GithubIssueComments { get; set; } = new List<GithubIssueComment>();

    public virtual ICollection<GithubIssue> GithubIssueassigneeGithubUsers { get; set; } = new List<GithubIssue>();

    public virtual ICollection<GithubIssue> GithubIssueauthorGithubUsers { get; set; } = new List<GithubIssue>();

    public virtual ICollection<GithubPullRequest> GithubPullRequests { get; set; } = new List<GithubPullRequest>();
}
