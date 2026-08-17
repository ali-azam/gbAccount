namespace GBWeb.Implementation.Domain.Modules.Account.Entities;

public sealed class AccTrxDetail
{
    public long TrxDetailsID { get; set; }

    public long TrxMasterID { get; set; }

    public int? AccID { get; set; }

    public decimal? Credit { get; set; }

    public decimal? Debit { get; set; }

    public string? Narration { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? InActiveDate { get; set; }

    public string CreateUser { get; set; } = string.Empty;

    public DateTime CreateDate { get; set; }

    public AccTrxMaster? TrxMaster { get; set; }

    public AccChart? Account { get; set; }
}