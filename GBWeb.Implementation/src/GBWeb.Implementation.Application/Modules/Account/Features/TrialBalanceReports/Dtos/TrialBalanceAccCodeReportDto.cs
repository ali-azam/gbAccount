namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;

/// <summary>
/// Account Code wise trial balance response.
/// </summary>
/// <param name="AsOnDate">
/// The snapshot actually used. OLRSTrailBalance stores one snapshot
/// per to_date, so the handler resolves the latest snapshot at or
/// before the requested Date To rather than summing several — this
/// tells the caller which one it landed on. Null when no snapshot
/// exists for the requested criteria.
/// </param>
public sealed record TrialBalanceAccCodeReportDto(
    DateTime? AsOnDate,
    int? AccLevel,
    IReadOnlyList<TrialBalanceAccCodeRowDto> Rows,
    TrialBalanceTotalsDto Totals
);
