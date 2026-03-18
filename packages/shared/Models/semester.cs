using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace JiraGithubExport.Shared.Models;

public partial class semester
{
    public long id { get; set; }

    public string name { get; set; } = null!;

    public DateOnly? start_date { get; set; }

    public DateOnly? end_date { get; set; }

    public DateTime created_at { get; set; }

    public virtual ICollection<course> courses { get; set; } = new List<course>();

    // Aliases
    [NotMapped]
    public long Id { get => id; set => id = value; }
    [NotMapped]
    public string Name { get => name; set => name = value; }
}
