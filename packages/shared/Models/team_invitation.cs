using System.ComponentModel.DataAnnotations;

namespace JiraGithubExport.Shared.Models;

public partial class team_invitation
{
    public long id { get; set; }

    public long project_id { get; set; }

    public long invited_by_user_id { get; set; }   // người mời (leader/lecturer)

    public long invited_student_user_id { get; set; } // sinh viên được mời

    public string status { get; set; } = "PENDING";   // PENDING | ACCEPTED | REJECTED

    public string? message { get; set; }

    public DateTime created_at { get; set; }

    public DateTime? responded_at { get; set; }

    public virtual project project { get; set; } = null!;

    public virtual user invited_by_user { get; set; } = null!;

    public virtual student invited_student_user { get; set; } = null!;
}
