using System;
using System.ComponentModel.DataAnnotations.Schema;

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

    // Aliases
    [NotMapped]
    public long Id { get => id; set => id = value; }
    [NotMapped]
    public long RecipientUserId { get => recipient_user_id; set => recipient_user_id = value; }
    [NotMapped]
    public string Message { get => message; set => message = value; }
    [NotMapped]
    public bool IsRead { get => is_read; set => is_read = value; }
    [NotMapped]
    public DateTime CreatedAt { get => created_at; set => created_at = value; }
    [NotMapped]
    public string? Metadata { get => metadata; set => metadata = value; }
    [NotMapped]
    public string Type { get => type; set => type = value; }
}
