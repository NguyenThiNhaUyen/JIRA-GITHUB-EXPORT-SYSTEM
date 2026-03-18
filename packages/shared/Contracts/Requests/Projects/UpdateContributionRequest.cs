using System.ComponentModel.DataAnnotations;

namespace JiraGithubExport.Shared.Contracts.Requests.Projects;

public class UpdateContributionRequest
{
    [Range(0, 100)]
    public decimal? ContributionScore { get; set; }
}

