using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class lecturer
{
    public long user_id { get; set; }

    public string lecturer_code { get; set; } = null!;

    public string? department { get; set; }

    public string? office_email { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual user user { get; set; } = null!;

    public virtual ICollection<course> courses { get; set; } = new List<course>();
}








