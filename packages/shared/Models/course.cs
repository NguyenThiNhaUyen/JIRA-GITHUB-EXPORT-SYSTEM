using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class course
{
    public long id { get; set; }

    public long semester_id { get; set; }

    public long subject_id { get; set; }

    public string course_code { get; set; } = null!;

    public string? course_name { get; set; }

    public long created_by_user_id { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual ICollection<course_enrollment> course_enrollments { get; set; } = new List<course_enrollment>();

    public virtual user created_by_user { get; set; } = null!;

    public virtual ICollection<project> projects { get; set; } = new List<project>();

    public virtual semester semester { get; set; } = null!;

    public virtual subject subject { get; set; } = null!;

    public virtual ICollection<lecturer> lecturer_users { get; set; } = new List<lecturer>();
}








