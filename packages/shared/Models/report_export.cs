using System;

namespace JiraGithubExport.Shared.Models;

public partial class report_export
{
    public long id { get; set; }

    public string report_type { get; set; } = null!; // 'COMMIT_STATS', 'TEAM_ROSTER', 'SRS_HISTORY'

    public string scope { get; set; } = null!; // 'COURSE', 'PROJECT', 'STUDENT'

    public long scope_entity_id { get; set; }

    public string format { get; set; } = null!; // 'CSV', 'PDF', 'DOCX'

    public string status { get; set; } = null!; // 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'

    public string? file_url { get; set; }

    public long? file_size_bytes { get; set; }

    public long requested_by_user_id { get; set; }

    public DateTime requested_at { get; set; }

    public DateTime? completed_at { get; set; }

    public string? error_message { get; set; }

    public DateTime? expires_at { get; set; }

    // Navigation properties
    public virtual user requested_by_user { get; set; } = null!;
}








