using System.ComponentModel.DataAnnotations;

namespace JiraGithubExport.Shared.Contracts.Requests.Projects;

public class CreateInvitationRequest
{
    [Required]
    public long StudentUserId { get; set; }
    
    public string? Message { get; set; }
}
