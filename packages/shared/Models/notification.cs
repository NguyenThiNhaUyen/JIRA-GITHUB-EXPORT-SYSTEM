using System;

namespace JiraGithubExport.Shared.Models;

public partial class Notification
{
    public long Id { get; set; }

    public long RecipientUserId { get; set; }

    public string Type { get; set; } = "SYSTEM"; // "SYSTEM", "INVITATION", "ALERT"

    public string Message { get; set; } = null!;

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }

    public string Metadata { get; set; } // JSON string for extra info like projectId, courseId

    // Navigation properties
    public virtual User RecipientUser { get; set; } = null!;
}
