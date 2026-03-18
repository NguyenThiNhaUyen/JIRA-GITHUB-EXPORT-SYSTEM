using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace JiraGithubExport.Shared.Models;

public partial class course_enrollment
{
    public long course_id { get; set; }

    public long student_user_id { get; set; }

    public string status { get; set; } = null!;

    public DateTime enrolled_at { get; set; }

    public virtual course course { get; set; } = null!;

    public virtual student student_user { get; set; } = null!;

    // Aliases
    [NotMapped]
    public long CourseId { get => course_id; set => course_id = value; }
    [NotMapped]
    public long StudentUserId { get => student_user_id; set => student_user_id = value; }
    [NotMapped]
    public string Status { get => status; set => status = value; }
    [NotMapped]
    public virtual course Course { get => course; set => course = value; }
    [NotMapped]
    public virtual student StudentUser { get => student_user; set => student_user = value; }
}
