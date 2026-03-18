using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace JiraGithubExport.Shared.Models;

public partial class course
{
    public long id { get; set; }

    public long subject_id { get; set; }

    public long semester_id { get; set; }

    public string course_code { get; set; } = null!;

    public string? course_name { get; set; }

    public int? max_students { get; set; }

    public string status { get; set; } = "ACTIVE";

    public long? created_by_user_id { get; set; }

    public System.DateTime created_at { get; set; }

    public System.DateTime updated_at { get; set; }

    public virtual user created_by_user { get; set; } = null!;

    public virtual semester semester { get; set; } = null!;

    public virtual subject subject { get; set; } = null!;

    public virtual ICollection<course_enrollment> course_enrollments { get; set; } = new List<course_enrollment>();

    public virtual ICollection<project> projects { get; set; } = new List<project>();

    public virtual ICollection<lecturer> lecturer_users { get; set; } = new List<lecturer>();

    // Aliases for business logic
    [NotMapped]
    public long Id { get => id; set => id = value; }
    [NotMapped]
    public string CourseCode { get => course_code; set => course_code = value; }
    [NotMapped]
    public string? CourseName { get => course_name; set => course_name = value; }
    [NotMapped]
    public int? MaxStudents { get => max_students; set => max_students = value; }
    [NotMapped]
    public string Status { get => status; set => status = value; }
    [NotMapped]
    public virtual ICollection<lecturer> LecturerUsers { get => lecturer_users; set => lecturer_users = value; }
    [NotMapped]
    public virtual subject Subject { get => subject; set => subject = value; }
    [NotMapped]
    public virtual semester Semester { get => semester; set => semester = value; }
    [NotMapped]
    public virtual ICollection<project> Projects { get => projects; set => projects = value; }
    [NotMapped]
    public virtual ICollection<course_enrollment> CourseEnrollments { get => course_enrollments; set => course_enrollments = value; }
}
