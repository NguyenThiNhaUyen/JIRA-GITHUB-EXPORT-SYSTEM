using System;

namespace JiraGithubExport.Shared.Models;

public partial class notification
{
    public long id { get; set; }

    public long recipient_user_id { get; set; }

    public string type { get; set; } = "SYSTEM"; // "SYSTEM", "INVITATION", "ALERT"

    public string message { get; set; } = null!;

    public bool is_read { get; set; }

    public DateTime created_at { get; set; }

    public string? metadata { get; set; } // JSON string for extra info like projectId, courseId

    // Navigation properties
    public virtual user recipient_user { get; set; } = null!;
}
