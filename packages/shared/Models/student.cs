using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class Student : JiraGithubExport.Shared.Interfaces.ISoftDelete
{
    public long UserId { get; set; }

    public string StudentCode { get; set; } = null!;

    public string Major { get; set; }

    public int IntakeYear { get; set; }

    public string Department { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<CourseEnrollment> CourseEnrollments { get; set; } = new List<CourseEnrollment>();

    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();

    public virtual User User { get; set; } = null!;

    public bool IsDeleted { get; set; }
}
