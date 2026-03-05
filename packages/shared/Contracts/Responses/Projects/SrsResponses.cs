namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class SrsDocumentResponse
{
    public long Id { get; set; }
    public long ProjectId { get; set; }
    public int VersionNo { get; set; }
    public string Status { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public long SubmittedByUserId { get; set; }
    public string? SubmittedByName { get; set; }
    public DateTime SubmittedAt { get; set; }
    public long? ReviewerUserId { get; set; }
    public string? ReviewerName { get; set; }
    public string? Feedback { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
