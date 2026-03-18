using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class ProjectDocument : JiraGithubExport.Shared.Interfaces.ISoftDelete
{
    public long Id { get; set; }

    public long ProjectId { get; set; }

    public string DocType { get; set; } = null!;

    public int VersionNo { get; set; }

    public string Status { get; set; } = null!;

    public string FileUrl { get; set; } = null!;

    public long SubmittedByUserId { get; set; }

    public DateTime SubmittedAt { get; set; }

    public long? ReviewerUserId { get; set; }

    public decimal Score { get; set; }

    public string? Feedback { get; set; }

    public string? Metadata { get; set; } // For checklist JSON

    public DateTime? ReviewedAt { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual User SubmittedByUser { get; set; } = null!;

    public virtual User ReviewerUser { get; set; }

    public bool IsDeleted { get; set; }
}
