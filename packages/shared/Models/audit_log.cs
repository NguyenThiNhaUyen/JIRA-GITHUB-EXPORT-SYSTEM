using System;

namespace JiraGithubExport.Shared.Models;

public partial class audit_log
{
    public long id { get; set; }

    public string action { get; set; } = null!; // 'ENROLL_STUDENT', 'CREATE_PROJECT', 'LINK_GITHUB', etc.

    public string entity_type { get; set; } = null!; // 'COURSE', 'PROJECT', 'ENROLLMENT', 'SRS'

    public long entity_id { get; set; }

    public long? performed_by_user_id { get; set; }

    public DateTime timestamp { get; set; }

    public string? ip_address { get; set; }

    public string? user_agent { get; set; }

    public string? old_values { get; set; } // JSONB as string

    public string? new_values { get; set; } // JSONB as string

    public string? metadata { get; set; } // JSONB as string

    // Navigation properties
    public virtual user? performed_by_user { get; set; }
}








