using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class ProjectIntegration
{
    public long ProjectId { get; set; }

    public long? JiraProjectId { get; set; }

    public long? GithubRepoId { get; set; }

    // Approval workflow
    public string ApprovalStatus { get; set; } = "PENDING"; // PENDING | APPROVED | REJECTED

    public long? SubmittedByUserId { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public long? ApprovedByUserId { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public string? RejectedReason { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual GithubRepository GithubRepo { get; set; }

    public virtual JiraProject? JiraProject { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual User SubmittedBy { get; set; }

    public virtual User ApprovedBy { get; set; }
}
