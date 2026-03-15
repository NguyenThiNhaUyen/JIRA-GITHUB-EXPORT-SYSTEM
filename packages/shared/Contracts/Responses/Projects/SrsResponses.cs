namespace JiraGithubExport.Shared.Contracts.Responses.Projects;

public class SrsDocumentResponse
{
    public long Id { get; set; }
    public long ProjectId { get; set; }
<<<<<<< HEAD
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
=======
    public string? ProjectName { get; set; }
    public int VersionNo { get; set; }
    public string Version => $"v{VersionNo}.0";
    public string Status { get; set; } = null!;
    public string? Milestone { get; set; }
    public string FileUrl { get; set; } = null!;
    public string? SubmittedByName { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? Deadline { get; set; }
    public string? ReviewerName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? Feedback { get; set; }
    public decimal? Score { get; set; }
    public string? Metadata { get; set; } // For checklist JSON
}

public class SrsListResponse
{
    public List<SrsDocumentResponse> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public SrsSummary Summary { get; set; } = new();
}

public class SrsSummary
{
    public int Total { get; set; }
    public int Submitted { get; set; }
    public int UnderReview { get; set; }
    public int NeedRevision { get; set; }
    public int Approved { get; set; }
    public int Overdue { get; set; }
>>>>>>> origin
}
