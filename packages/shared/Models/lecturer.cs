using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class Lecturer : JiraGithubExport.Shared.Interfaces.ISoftDelete
{
    public long UserId { get; set; }

    public string LecturerCode { get; set; } = null!;

    public string Department { get; set; }

    public string OfficeEmail { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public bool IsDeleted { get; set; }
}
