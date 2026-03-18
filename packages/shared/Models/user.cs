using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace JiraGithubExport.Shared.Models;

public partial class user
{
    public long id { get; set; }

    public string email { get; set; } = null!;

    public string password { get; set; } = null!;

    public string? full_name { get; set; }

    public bool enabled { get; set; }

    public string? password_reset_token { get; set; }

    public DateTime? password_reset_token_expires_at { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual ICollection<course> courses { get; set; } = new List<course>();

    public virtual ICollection<external_account> external_accounts { get; set; } = new List<external_account>();

    public virtual lecturer? lecturer { get; set; }

    public virtual ICollection<project_document> project_documents { get; set; } = new List<project_document>();

    public virtual student? student { get; set; }

    public virtual ICollection<role> roles { get; set; } = new List<role>();

    // Aliases for business logic
    [NotMapped]
    public long Id { get => id; set => id = value; }
    [NotMapped]
    public string FullName { get => full_name; set => full_name = value; }
    [NotMapped]
    public string Email { get => email; set => email = value; }
    [NotMapped]
    public virtual ICollection<role> Roles { get => roles; set => roles = value; }
}








