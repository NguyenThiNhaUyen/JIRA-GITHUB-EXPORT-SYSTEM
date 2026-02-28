using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class user
{
    public long id { get; set; }

    public string email { get; set; } = null!;

    public string password { get; set; } = null!;

    public string? full_name { get; set; }

    public bool enabled { get; set; }

    public DateTime created_at { get; set; }

    public DateTime updated_at { get; set; }

    public virtual ICollection<course> courses { get; set; } = new List<course>();

    public virtual ICollection<external_account> external_accounts { get; set; } = new List<external_account>();

    public virtual lecturer? lecturer { get; set; }

    public virtual ICollection<project_document> project_documents { get; set; } = new List<project_document>();

    public virtual student? student { get; set; }

    public virtual ICollection<role> roles { get; set; } = new List<role>();
}








