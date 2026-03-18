using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace JiraGithubExport.Shared.Models;

public partial class project
{
    public long id { get; set; }

    public long course_id { get; set; }

    public string name { get; set; } = null!;

    public string? description { get; set; }

    public string status { get; set; } = "ACTIVE";

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual course course { get; set; } = null!;

    public virtual ICollection<project_document> project_documents { get; set; } = new List<project_document>();

    public virtual project_integration? project_integration { get; set; }

    public virtual ICollection<team_member> team_members { get; set; } = new List<team_member>();

    // Aliases
    [NotMapped]
    public long Id { get => id; set => id = value; }
    [NotMapped]
    public string Name { get => name; set => name = value; }
    [NotMapped]
    public string Status { get => status; set => status = value; }
    [NotMapped]
    public virtual project_integration? ProjectIntegration { get => project_integration; set => project_integration = value; }
}
