namespace JiraGithubExport.JiraService.DTOs;

/// <summary>
/// Jira Issue Response from API
/// </summary>
public class JiraIssueResponse
{
    public string Id { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public JiraIssueFields Fields { get; set; } = new();
}

public class JiraIssueFields
{
    public string Summary { get; set; } = string.Empty;
    public string? Description { get; set; }
    public JiraStatus Status { get; set; } = new();
    public JiraPriority? Priority { get; set; }
    public JiraUser? Assignee { get; set; }
    public JiraUser? Reporter { get; set; }
    public DateTime Created { get; set; }
    public DateTime Updated { get; set; }
    public DateTime? Resolutiondate { get; set; }
    public JiraIssueType Issuetype { get; set; } = new();
}

public class JiraStatus
{
    public string Name { get; set; } = string.Empty;
    public string Id { get; set; } = string.Empty;
}

public class JiraPriority
{
    public string Name { get; set; } = string.Empty;
}

public class JiraUser
{
    public string AccountId { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? EmailAddress { get; set; }
}

public class JiraIssueType
{
    public string Name { get; set; } = string.Empty;
}

public class JiraSearchResponse
{
    public int StartAt { get; set; }
    public int MaxResults { get; set; }
    public int Total { get; set; }
    public List<JiraIssueResponse> Issues { get; set; } = new();
}

public class JiraProjectResponse
{
    public string Id { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
