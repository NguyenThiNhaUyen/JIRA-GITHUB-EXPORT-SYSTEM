using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class JiraProject
{
    public long Id { get; set; }

    public string JiraProjectKey { get; set; } = null!;

    public string JiraProjectId { get; set; }

    public string ProjectName { get; set; } = null!;

    public string JiraUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<JiraIssue> JiraIssues { get; set; } = new List<JiraIssue>();

    public virtual ProjectIntegration? ProjectIntegration { get; set; }
}

