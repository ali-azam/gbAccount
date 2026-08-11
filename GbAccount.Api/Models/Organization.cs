using System;
using System.Collections.Generic;

namespace GbAccount.Api.Models;

public partial class Organization
{
    public int OrgId { get; set; }

    public string? OrganizationCode { get; set; }

    public string? OrganizationName { get; set; }

    public bool IsActive { get; set; }

    public DateTime? InActiveDate { get; set; }

    public string CreateUser { get; set; } = null!;

    public DateTime CreateDate { get; set; }

    public string? OrgAddress { get; set; }

    public byte[]? OrgLogo { get; set; }

    public int? MemberAge { get; set; }

    public int? LoanAge { get; set; }

    public int? GuarantorAge { get; set; }

    public virtual ICollection<AccChart> AccCharts { get; set; } = new List<AccChart>();
}
