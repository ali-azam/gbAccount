using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Dtos;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.GetComputedTrialBalanceByOffice;

/// <summary>
/// Trial balance computed from live vouchers, one row per office and
/// account, as JSON for the on-screen table.
/// </summary>
/// <remarks>
/// This is the report the snapshot cannot produce at all:
/// OLRSTrailBalance holds a single consolidated office, while the
/// vouchers cover every branch that has posted.
/// </remarks>
/// <param name="OfficeId">
/// Any office in the hierarchy. Choosing a head, zone or area office
/// includes every office beneath it as its own block; leaving it out
/// covers all offices.
/// </param>
/// <param name="AccLevel">
/// Which level of the chart the accounts are rolled up to, 1 to 5.
/// Combined with <paramref name="AccCode"/> it also selects the accounts
/// to include: the named account and its descendants.
/// </param>
/// <param name="ExceptProjectOffice">
/// Drops offices flagged as project offices. Nothing sets that flag in
/// the current data, so this removes no rows until it is populated.
/// </param>
/// <param name="DetailLevel">
/// Detail lists every account at <paramref name="AccLevel"/> within each
/// office; Summary rolls them up to their account head.
/// </param>
public sealed record GetComputedTrialBalanceByOfficeQuery(
    DateTime DateFrom,
    DateTime DateTo,
    int? OfficeId,
    int? AccLevel,
    string? AccCode,
    bool ExceptHeadOffice,
    bool ExceptProjectOffice,
    TrialBalanceDetailLevel DetailLevel
) : IRequest<TrialBalanceOfficeReportDto>;
