namespace JiraGithubExport.GithubService.DTOs;

public class GitHubRepoResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string HtmlUrl { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DefaultBranch { get; set; }
    public string Visibility { get; set; } = "public";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public GitHubOwner Owner { get; set; } = new();
}

public class GitHubOwner
{
    public long Id { get; set; }
    public string Login { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
}

public class GitHubCommitResponse
{
    public string Sha { get; set; } = string.Empty;
    public string HtmlUrl { get; set; } = string.Empty;
    public GitHubCommitData Commit { get; set; } = new();
    public GitHubUser? Author { get; set; }
    public GitHubUser? Committer { get; set; }
}

public class GitHubCommitData
{
    public string Message { get; set; } = string.Empty;
    public GitHubCommitAuthor Author { get; set; } = new();
    public GitHubCommitAuthor Committer { get; set; } = new();
}

public class GitHubCommitAuthor
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}

public class GitHubUser
{
    public long Id { get; set; }
    public string Login { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string Type { get; set; } = "User";
}

public class GitHubPullRequestResponse
{
    public long Id { get; set; }
    public int Number { get; set; }
    public string State { get; set; } = "open";
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime? MergedAt { get; set; }
    public GitHubUser User { get; set; } = new();
    public GitHubPRBranch Head { get; set; } = new();
    public GitHubPRBranch Base { get; set; } = new();
}

public class GitHubPRBranch
{
    public string Label { get; set; } = string.Empty;
    public string Ref { get; set; } = string.Empty;
    public string Sha { get; set; } = string.Empty;
}

public class GitHubBranchResponse
{
    public string Name { get; set; } = string.Empty;
    public GitHubCommitSummary Commit { get; set; } = new();
}

public class GitHubCommitSummary
{
    public string Sha { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}
