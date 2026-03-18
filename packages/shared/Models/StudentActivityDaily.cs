using System;

namespace JiraGithubExport.Shared.Models;

public partial class StudentActivityDaily
{
    public long Id { get; set; }

    public long StudentUserId { get; set; }

    public long ProjectId { get; set; }

    public DateOnly ActivityDate { get; set; }

    // GitHub metrics
    public int CommitsCount { get; set; }

    public int LinesAdded { get; set; }

    public int LinesDeleted { get; set; }

    public int PullRequestsCount { get; set; }

    public int CodeReviewsCount { get; set; }

    // Jira metrics
    public int IssuesCreated { get; set; }

    public int IssuesCompleted { get; set; }

    public int StoryPoints { get; set; }

    public decimal TimeLoggedHours { get; set; }

    public int CommentsCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Student Student { get; set; } = null!;

    public virtual Project Project { get; set; } = null!;
}
