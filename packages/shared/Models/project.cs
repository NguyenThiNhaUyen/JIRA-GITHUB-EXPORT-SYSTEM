using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class project
{
    public long id { get; set; }

    public long course_id { get; set; }

    public string name { get; set; } = null!;

    public string? description { get; set; }

    public string status { get; set; } = null!;

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual course course { get; set; } = null!;

    public virtual ICollection<project_document> project_documents { get; set; } = new List<project_document>();

    public virtual project_integration? project_integration { get; set; }

    public virtual ICollection<team_member> team_members { get; set; } = new List<team_member>();
}








