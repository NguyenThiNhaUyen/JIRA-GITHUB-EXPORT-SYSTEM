using System;
using System.Collections.Generic;

namespace JiraGithubExport.Shared.Models;

public partial class subject
{
    public long id { get; set; }

    public string subject_code { get; set; } = null!;

    public string subject_name { get; set; } = null!;

<<<<<<< HEAD
=======
    public string department { get; set; } = null!;

    public string? description { get; set; }

    public int credits { get; set; } = 3;

    public int max_students { get; set; } = 40;

    public string status { get; set; } = "ACTIVE";

>>>>>>> origin
    public DateTime created_at { get; set; }

    public virtual ICollection<course> courses { get; set; } = new List<course>();
}








