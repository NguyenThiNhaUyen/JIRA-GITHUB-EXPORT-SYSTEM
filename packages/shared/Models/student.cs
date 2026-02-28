using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class student
{
    public long user_id { get; set; }

    public string student_code { get; set; } = null!;

    public string? major { get; set; }

    public int? intake_year { get; set; }

    public string? department { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual ICollection<course_enrollment> course_enrollments { get; set; } = new List<course_enrollment>();

    public virtual ICollection<team_member> team_members { get; set; } = new List<team_member>();

    public virtual user user { get; set; } = null!;
}








