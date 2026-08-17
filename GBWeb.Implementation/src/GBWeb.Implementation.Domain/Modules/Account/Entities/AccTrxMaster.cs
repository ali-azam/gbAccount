namespace GBWeb.Implementation.Domain.Modules.Account.Entities;

public sealed class AccTrxMaster
{
    public long TrxMasterID { get; set; }

    public int OfficeID { get; set; }

    public DateTime TrxDate { get; set; }

    public string VoucherNo { get; set; } = string.Empty;

    public string? VoucherDesc { get; set; }

    public string? VoucherType { get; set; }

    public string? Reference { get; set; }

    public bool? IsPosted { get; set; }

    public bool? IsYearlyClosing { get; set; }

    public bool? IsAutoVoucher { get; set; }

    public bool? IsRectify { get; set; }

    public int OrgID { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? InActiveDate { get; set; }

    public string CreateUser { get; set; } = string.Empty;

    public DateTime CreateDate { get; set; }

    public bool? IsReconcileVoucher { get; set; }

    public ICollection<AccTrxDetail> Details { get; set; } =
        new List<AccTrxDetail>();
}