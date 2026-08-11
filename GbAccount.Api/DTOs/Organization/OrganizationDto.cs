namespace GbAccount.Api.DTOs.Organization;


/// Read model for an organization. Original database casing (OrgID) is kept for
/// the same reason as AccChartDto — the existing client reads these keys.
/// OrgLOGO is intentionally omitted: it is a binary blob that would bloat every
/// list response and no current screen renders it.

public class OrganizationDto
{
    public int OrgID { get; set; }
    public string? OrganizationCode { get; set; }
    public string? OrganizationName { get; set; }
    public bool IsActive { get; set; }
    public DateTime? InActiveDate { get; set; }
    public string CreateUser { get; set; } = string.Empty;
    public DateTime CreateDate { get; set; }
    public string? OrgAddress { get; set; }
    public int? MemberAge { get; set; }
    public int? LoanAge { get; set; }
    public int? GuarantorAge { get; set; }
}
