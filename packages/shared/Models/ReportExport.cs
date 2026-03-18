using System;

namespace JiraGithubExport.Shared.Models;

public partial class ReportExport
{
    public long Id { get; set; }

    public string ReportType { get; set; } = null!; // 'COMMIT_STATS', 'TEAM_ROSTER', 'SRS_HISTORY'

    public string Scope { get; set; } = null!; // 'Course', 'Project', 'Student'

    public long ScopeEntityId { get; set; }

    public string Format { get; set; } = null!; // 'CSV', 'PDF', 'DOCX'

    public string Status { get; set; } = null!; // 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'

    public string FileUrl { get; set; }

    public long FileSizeBytes { get; set; }

    public long RequestedByUserId { get; set; }

    public DateTime RequestedAt { get; set; }

    public DateTime CompletedAt { get; set; }

    public string ErrorMessage { get; set; }

    public DateTime ExpiresAt { get; set; }

    // Navigation properties
    public virtual User RequestedByUser { get; set; } = null!;
}

