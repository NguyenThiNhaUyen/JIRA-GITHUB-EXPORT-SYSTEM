using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace JiraGithubExportSystem.Shared.Contracts.Requests.Projects;

public class UploadSrsRequest
{
    [Required]
    public IFormFile File { get; set; } = null!;
}

public class ReviewSrsStatusRequest
{
    [Required]
    [RegularExpression("^(FINAL|DRAFT)$", ErrorMessage = "Status must be FINAL or DRAFT")]
    public string Status { get; set; } = null!;
    
    public string? Feedback { get; set; }
}

public class ReviewSrsFeedbackRequest
{
    [Required]
    public string Feedback { get; set; } = null!;
}
