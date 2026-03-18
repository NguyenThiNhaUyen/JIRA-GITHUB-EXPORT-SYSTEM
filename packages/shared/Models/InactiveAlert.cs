using System;

namespace JiraGithubExport.Shared.Models;

public partial class InactiveAlert
{
    public long Id { get; set; }

    public string AlertType { get; set; } = null!; // 'STUDENT_INACTIVE', 'REPO_INACTIVE'

    public string TargetEntityType { get; set; } = null!; // 'Student', 'Project'

    public long TargetEntityId { get; set; }

    public long ProjectId { get; set; }

    public string Severity { get; set; } = null!; // 'INFO', 'WARNING', 'CRITICAL'

    public string Message { get; set; } = null!;

    public int ThresholdDays { get; set; }

    public DateTime LastActivityAt { get; set; }

    public bool IsResolved { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public long? ResolvedByUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Project? Project { get; set; }

    public virtual User ResolvedByUser { get; set; }
}
