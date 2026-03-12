using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class course_enrollment
{
    public long course_id { get; set; }

    public long student_user_id { get; set; }

    public string status { get; set; } = null!;

    public DateTime enrolled_at { get; set; }

    public virtual course course { get; set; } = null!;

    public virtual student student_user { get; set; } = null!;
}








