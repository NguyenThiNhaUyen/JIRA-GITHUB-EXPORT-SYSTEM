using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class team_member
{
    public long id { get; set; }

    public long project_id { get; set; }

    public long student_user_id { get; set; }

    public string team_role { get; set; } = null!;

    public string? responsibility { get; set; }

    public string participation_status { get; set; } = null!;

    public DateTime joined_at { get; set; }

    public DateTime? left_at { get; set; }

    public virtual project project { get; set; } = null!;

    public virtual student student_user { get; set; } = null!;
}








