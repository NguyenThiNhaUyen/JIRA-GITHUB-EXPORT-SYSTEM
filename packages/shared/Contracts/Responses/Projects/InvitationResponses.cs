namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class InvitationResponse
{
    public long Id { get; set; }
<<<<<<< HEAD
    public long ProjectId { get; set; }
    public string ProjectName { get; set; } = null!;
    public long InvitedByUserId { get; set; }
    public string InvitedByName { get; set; } = null!;
    public long InvitedStudentUserId { get; set; }
    public string InvitedStudentName { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
=======
    public long GroupId { get; set; }
    public string GroupName { get; set; } = null!;
    public long CourseId { get; set; }
    public string CourseName { get; set; } = null!;
    public long InvitedStudentId { get; set; }
    public string? InvitedStudentName { get; set; }
    public long InvitedByStudentId { get; set; }
    public string InvitedByName { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; }
>>>>>>> origin
}
