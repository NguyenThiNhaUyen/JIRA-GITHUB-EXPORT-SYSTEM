using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class role
{
    public long id { get; set; }

    public string role_name { get; set; } = null!;

    public virtual ICollection<user> users { get; set; } = new List<user>();
}








