using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace JiraGithubExport.Shared.Models;

public partial class role
{
    public long id { get; set; }

    public string role_name { get; set; } = null!;

    public virtual ICollection<user> users { get; set; } = new List<user>();

    // Aliases
    [NotMapped]
    public long Id { get => id; set => id = value; }
    [NotMapped]
    public string RoleName { get => role_name; set => role_name = value; }
}
