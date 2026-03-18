using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class Semester : JiraGithubExport.Shared.Interfaces.ISoftDelete
{
    public long Id { get; set; }

    public string Name { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public bool IsDeleted { get; set; }
}
