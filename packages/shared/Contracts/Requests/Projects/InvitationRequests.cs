using System.ComponentModel.DataAnnotations;

namespace JiraGithubExportSystem.Shared.Contracts.Requests.Projects;

public class CreateInvitationRequest
{
    [Required]
    public long StudentUserId { get; set; }
    
    public string? Message { get; set; }
}
