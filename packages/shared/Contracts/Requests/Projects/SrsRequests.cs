using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace JiraGithubExport.Shared.Contracts.Requests.Projects;

public class UploadSrsRequest
{
    [Required]
    public IFormFile File { get; set; } = null!;
}

public class ReviewSrsStatusRequest
{
    [Required]
    [RegularExpression("^(APPROVED|REJECTED|NEED_REVISION|UNDER_REVIEW|FINAL|DRAFT)$", ErrorMessage = "Status must be APPROVED, REJECTED, UNDER_REVIEW, NEED_REVISION, FINAL or DRAFT")]
    public string Status { get; set; } = null!;
    
    public string? Feedback { get; set; }
    public decimal? Score { get; set; }
    public string? Metadata { get; set; } // JSON checklist
}

public class ReviewSrsFeedbackRequest
{
    [Required]
    public string Feedback { get; set; } = null!;
}
