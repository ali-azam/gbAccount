namespace GbAccount.Api.DTOs.AccChart;


/// Read model for a chart-of-accounts row.
///
/// Property names deliberately keep the database's original casing (AccID, not
/// AccId) because the existing React client reads these keys directly — see
/// AccChartRow in src/lib/useAccounts.ts. EF's scaffolder renames ID -> Id on
/// the entity, so this DTO is what restores the contract the UI depends on.

public class AccChartDto
{
    public int AccID { get; set; }
    public string AccCode { get; set; } = string.Empty;
    public string? AccName { get; set; }
    public int? AccLevel { get; set; }
    public string? FirstLevel { get; set; }
    public string? SecondLevel { get; set; }
    public string? ThirdLevel { get; set; }
    public string? FourthLevel { get; set; }
    public string? FifthLevel { get; set; }
    public int? CategoryID { get; set; }
    public int? OfficeLevel { get; set; }
    public bool? IsTransaction { get; set; }
    public string? Nature { get; set; }
    public int? ModuleID { get; set; }
    public int? NoteID { get; set; }
    public int OrgID { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? InActiveDate { get; set; }
    public string CreateUser { get; set; } = string.Empty;
    public DateTime CreateDate { get; set; }
    public string? BankAccountNo { get; set; }
    public string? Address { get; set; }

    
    /// Joined category. The UI reads AccCategory?.CategoryName to render the
    /// Category column, so the nested object is preserved rather than flattened.
    
    public AccCategoryDto? AccCategory { get; set; }

    public OrganizationSummaryDto? Organization { get; set; }
}

public class AccCategoryDto
{
    public int CategoryID { get; set; }
    public string? CategoryName { get; set; }
    public string CreateUser { get; set; } = string.Empty;
    public DateTime CreateDate { get; set; }
}

public class OrganizationSummaryDto
{
    public int OrgID { get; set; }
    public string? OrganizationCode { get; set; }
    public string? OrganizationName { get; set; }
    public bool IsActive { get; set; }
}
