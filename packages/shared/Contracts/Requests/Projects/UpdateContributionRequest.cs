using System.ComponentModel.DataAnnotations;

namespace JiraGithubExportSystem.Shared.Contracts.Requests.Projects;

public class UpdateContributionRequest
{
    [Range(0, 100)]
    public decimal? ContributionScore { get; set; }
}
