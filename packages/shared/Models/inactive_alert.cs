using System;

namespace JiraGithubExport.Shared.Models;

public partial class inactive_alert
{
    public long id { get; set; }

    public string alert_type { get; set; } = null!; // 'STUDENT_INACTIVE', 'REPO_INACTIVE'

    public string target_entity_type { get; set; } = null!; // 'STUDENT', 'PROJECT'

    public long target_entity_id { get; set; }

    public long? project_id { get; set; }

    public string severity { get; set; } = null!; // 'INFO', 'WARNING', 'CRITICAL'

    public string message { get; set; } = null!;

    public int threshold_days { get; set; }

    public DateTime? last_activity_at { get; set; }

    public bool is_resolved { get; set; }

    public DateTime? resolved_at { get; set; }

    public long? resolved_by_user_id { get; set; }

    public DateTime created_at { get; set; }

    // Navigation properties
    public virtual project? project { get; set; }

    public virtual user? resolved_by_user { get; set; }
}








