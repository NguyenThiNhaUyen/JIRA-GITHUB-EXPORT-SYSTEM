using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class Project : JiraGithubExport.Shared.Interfaces.ISoftDelete
{
    public long Id { get; set; }

    public long CourseId { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual ICollection<ProjectDocument> ProjectDocuments { get; set; } = new List<ProjectDocument>();

    public virtual ProjectIntegration? ProjectIntegration { get; set; }

    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();

    public bool IsDeleted { get; set; }
}
