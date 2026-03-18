using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class TeamMember
{
    public long Id { get; set; }

    public long ProjectId { get; set; }

    public long StudentUserId { get; set; }

    public string TeamRole { get; set; } = null!;

    public string Responsibility { get; set; }

    public string ParticipationStatus { get; set; } = null!;

    public decimal ContributionScore { get; set; } // Lecturer-assigned score 0-100

    public DateTime JoinedAt { get; set; }

    public DateTime LeftAt { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual Student StudentUser { get; set; } = null!;
}

