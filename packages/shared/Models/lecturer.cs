using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace JiraGithubExport.Shared.Models;

public partial class lecturer
{
    public long user_id { get; set; }

    public string lecturer_code { get; set; } = null!;

    public string? department { get; set; }

    public string? office_email { get; set; }

    public System.DateTime created_at { get; set; }

    public System.DateTime updated_at { get; set; }

    public virtual user user { get; set; } = null!;

    public virtual ICollection<course> courses { get; set; } = new List<course>();

    // Aliases
    [NotMapped]
    public long UserId { get => user_id; set => user_id = value; }
    [NotMapped]
    public string LecturerCode { get => lecturer_code; set => lecturer_code = value; }
    [NotMapped]
    public string OfficeEmail { get => office_email; set => office_email = value; }
    [NotMapped]
    public virtual ICollection<course> Courses { get => courses; set => courses = value; }
    [NotMapped]
    public string? Department { get => department; set => department = value; }
    [NotMapped]
    public System.DateTime CreatedAt { get => created_at; set => created_at = value; }
    [NotMapped]
    public System.DateTime UpdatedAt { get => updated_at; set => updated_at = value; }
}
