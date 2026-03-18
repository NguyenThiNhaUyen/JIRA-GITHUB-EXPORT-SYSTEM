using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class Subject : JiraGithubExport.Shared.Interfaces.ISoftDelete
{
    public long Id { get; set; }

    public string SubjectCode { get; set; } = null!;

    public string SubjectName { get; set; } = null!;

    public string Department { get; set; } = null!;

    public string Description { get; set; }

    public int Credits { get; set; } = 3;

    public int MaxStudents { get; set; } = 40;

    public string Status { get; set; } = "ACTIVE";

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public bool IsDeleted { get; set; }
}
