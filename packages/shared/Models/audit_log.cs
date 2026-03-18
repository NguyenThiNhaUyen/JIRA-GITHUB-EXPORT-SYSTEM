using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace JiraGithubExport.Shared.Models;

public partial class audit_log
{
    public long id { get; set; }

    public string action { get; set; } = null!;

    public string entity_type { get; set; } = null!;

    public long entity_id { get; set; }

    public long? performed_by_user_id { get; set; }

    public string? details { get; set; }

    public string? ip_address { get; set; }

    public string? old_values { get; set; }

    public string? new_values { get; set; }

    public string? metadata { get; set; }

    public DateTime timestamp { get; set; }

    // Navigation properties
    public virtual user? performed_by_user { get; set; }

    // Aliases
    [NotMapped]
    public long Id { get => id; set => id = value; }
    [NotMapped]
    public string Action { get => action; set => action = value; }
    [NotMapped]
    public string EntityType { get => entity_type; set => entity_type = value; }
    [NotMapped]
    public long EntityId { get => entity_id; set => entity_id = value; }
    [NotMapped]
    public long? PerformedByUserId { get => performed_by_user_id; set => performed_by_user_id = value; }
    [NotMapped]
    public DateTime Timestamp { get => timestamp; set => timestamp = value; }
}
