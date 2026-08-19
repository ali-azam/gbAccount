using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Queries.GetTrialBalanceByAccCode;

/// <summary>
/// Account Code wise trial balance — one row per account, summed
/// across every office in the snapshot.
/// </summary>
/// <param name="DateFrom">
/// Optional lower bound on the snapshot date. Leave it unset to take
/// the latest snapshot on or before <paramref name="DateTo"/>.
/// </param>
/// <param name="DateTo">
/// The as on date. The report reads the newest snapshot that is not
/// after this date.
/// </param>
/// <param name="AccLevel">
/// Account level the snapshot was rolled up to (acc_level).
/// </param>
/// <param name="AccCode">
/// Optional single account code to restrict the report to.
/// </param>
public sealed record GetTrialBalanceByAccCodeQuery(
    DateTime? DateFrom,
    DateTime DateTo,
    int? AccLevel,
    string? AccCode
) : IRequest<TrialBalanceAccCodeReportDto>;
