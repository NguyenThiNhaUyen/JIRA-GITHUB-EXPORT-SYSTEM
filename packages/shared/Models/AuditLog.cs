using System;

namespace JiraGithubExport.Shared.Models;

public partial class AuditLog
{
    public long Id { get; set; }

    public string Action { get; set; } = null!; // 'ENROLL_STUDENT', 'CREATE_PROJECT', 'LINK_GITHUB', etc.

    public string EntityType { get; set; } = null!; // 'Course', 'Project', 'ENROLLMENT', 'SRS'

    public long EntityId { get; set; }

    public long PerformedByUserId { get; set; }

    public DateTime Timestamp { get; set; }

    public string IpAddress { get; set; }

    public string UserAgent { get; set; }

    public string OldValues { get; set; } // JSONB as string

    public string NewValues { get; set; } // JSONB as string

    public string Metadata { get; set; } // JSONB as string

    // Navigation properties
    public virtual User PerformedByUser { get; set; }
}

