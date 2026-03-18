using System.ComponentModel.DataAnnotations;

namespace JiraGithubExport.Shared.Models;

public partial class TeamInvitation
{
    public long Id { get; set; }

    public long ProjectId { get; set; }

    public long InvitedByUserId { get; set; }   // ngÆ°á»i má»i (leader/Lecturer)

    public long InvitedStudentUserId { get; set; } // sinh viĂªn Ä‘Æ°á»£c má»i

    public string Status { get; set; } = "PENDING";   // PENDING | ACCEPTED | REJECTED

    public string Message { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime RespondedAt { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual User InvitedByUser { get; set; } = null!;

    public virtual Student InvitedStudentUser { get; set; } = null!;
}

