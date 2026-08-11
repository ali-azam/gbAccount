using System;
using System.Collections.Generic;

namespace GbAccount.Api.Models;

public partial class AccCategory
{
    public int CategoryId { get; set; }

    public string? CategoryName { get; set; }

    public string CreateUser { get; set; } = null!;

    public DateTime CreateDate { get; set; }

    public virtual ICollection<AccChart> AccCharts { get; set; } = new List<AccChart>();
}
