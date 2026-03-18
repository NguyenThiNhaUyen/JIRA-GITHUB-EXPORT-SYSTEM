using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class User : JiraGithubExport.Shared.Interfaces.ISoftDelete
{
    public long Id { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string FullName { get; set; }

    public bool Enabled { get; set; }

    public string PasswordResetToken { get; set; }

    public DateTime? PasswordResetTokenExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual ICollection<ExternalAccount> ExternalAccounts { get; set; } = new List<ExternalAccount>();

    public virtual Lecturer? Lecturer { get; set; }

    public virtual ICollection<ProjectDocument> ProjectDocuments { get; set; } = new List<ProjectDocument>();

    public virtual Student? Student { get; set; }

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();

    public bool IsDeleted { get; set; }
}
