namespace GBWeb.Implementation.Domain.Modules.Organization.Entities;

public class Office
{
    public int OfficeID { get; set; }

    public string OfficeCode { get; set; } = string.Empty;

    public string OfficeName { get; set; } = string.Empty;

    public byte OfficeLevel { get; set; }

    public string FirstLevel { get; set; } = string.Empty;

    public string? SecondLevel { get; set; }

    public string? ThirdLevel { get; set; }

    public string? FourthLevel { get; set; }

    public DateTime OperationStartDate { get; set; }

    public string? OfficeAddress { get; set; }

    public string? PostCode { get; set; }

    public int? GeoLocationID { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? BankAsiaAccNo { get; set; }

    public string? PhonebKash { get; set; }

    public int OrgID { get; set; }

    public bool IsActive { get; set; }

    public DateTime? InActiveDate { get; set; }

    public string CreateUser { get; set; } = string.Empty;

    public DateTime CreateDate { get; set; }

    public int? InvestorID { get; set; }

    public int? UnionID { get; set; }

    public bool? IsProjectOffice { get; set; }

    public string? ProjectOffice { get; set; }

    public string? UnionCode { get; set; }
}