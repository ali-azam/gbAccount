namespace GBWeb.Implementation.Domain.Modules.Account.Entities;

/// <summary>
/// Pre-computed trial balance snapshot.
///
/// One row per office / account / account level, stamped with the
/// date the snapshot was taken (<see cref="ToDate"/>). Mapped to
/// pksf.OLRSTrailBalance — the "Trail" spelling is the physical
/// table name and is intentional here.
/// </summary>
public sealed class OlrsTrialBalance
{
    public int Id { get; set; }

    // ============================================================
    // OFFICE HIERARCHY
    // ============================================================

    public int? FirstLevel { get; set; }

    public string? FirstLevelName { get; set; }

    public string? DepartmentCode { get; set; }

    public string? OfficeName { get; set; }

    // ============================================================
    // ACCOUNT
    // ============================================================

    public string? TopLevelCode { get; set; }

    public string? TopLevelName { get; set; }

    public string? AccCode { get; set; }

    public string? AccName { get; set; }

    /// <summary>
    /// Display level as stored on the row (nvarchar). Use
    /// <see cref="AccountLevel"/> for filtering.
    /// </summary>
    public string? AccLevel { get; set; }

    // ============================================================
    // AMOUNTS
    // ============================================================

    public decimal? CurrentDebit { get; set; }

    public decimal? CurrentCredit { get; set; }

    public decimal? OpeningDebit { get; set; }

    public decimal? OpeningCredit { get; set; }

    public decimal? JournalDebit { get; set; }

    public decimal? JournalCredit { get; set; }

    public decimal? BalanceDebit { get; set; }

    public decimal? BalanceCredit { get; set; }

    public decimal? PreviousJournalDebit { get; set; }

    public decimal? PreviousJournalCredit { get; set; }

    // ============================================================
    // SNAPSHOT KEY
    // ============================================================

    /// <summary>
    /// The date this trial balance was computed up to.
    /// </summary>
    public DateTime? ToDate { get; set; }

    /// <summary>
    /// Numeric account level the snapshot was rolled up to.
    /// </summary>
    public int? AccountLevel { get; set; }
}
