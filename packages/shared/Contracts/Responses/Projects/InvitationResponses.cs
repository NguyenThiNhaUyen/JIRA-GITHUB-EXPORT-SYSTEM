namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class InvitationResponse
{
    public long Id { get; set; }
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
}
