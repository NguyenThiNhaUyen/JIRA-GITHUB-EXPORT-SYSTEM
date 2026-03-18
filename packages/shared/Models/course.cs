using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class Course : JiraGithubExport.Shared.Interfaces.ISoftDelete
{
    public long Id { get; set; }

    public long SemesterId { get; set; }

    public long SubjectId { get; set; }

    public string CourseCode { get; set; } = null!;

    public string CourseName { get; set; }

    public long CreatedByUserId { get; set; }

    public int MaxStudents { get; set; }

    public string Status { get; set; } = "ACTIVE"; // ACTIVE | INACTIVE

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<CourseEnrollment> CourseEnrollments { get; set; } = new List<CourseEnrollment>();

    public virtual User CreatedByUser { get; set; } = null!;

    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();

    public virtual Semester Semester { get; set; } = null!;

    public virtual Subject Subject { get; set; } = null!;

    public virtual ICollection<Lecturer> LecturerUsers { get; set; } = new List<Lecturer>();

    public bool IsDeleted { get; set; }
}
