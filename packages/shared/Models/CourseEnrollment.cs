using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class CourseEnrollment
{
    public long CourseId { get; set; }

    public long StudentUserId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime EnrolledAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual Student StudentUser { get; set; } = null!;
}

