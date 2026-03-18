using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class Role
{
    public long Id { get; set; }

    public string RoleName { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}

