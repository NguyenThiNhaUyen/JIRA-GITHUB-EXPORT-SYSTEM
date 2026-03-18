using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class JiraAttachment
{
    public long Id { get; set; }

    public long IssueId { get; set; }

    public string Filename { get; set; } = null!;

    public string Url { get; set; } = null!;

    public DateTime UploadedAt { get; set; }

    public virtual JiraIssue Issue { get; set; } = null!;
}
