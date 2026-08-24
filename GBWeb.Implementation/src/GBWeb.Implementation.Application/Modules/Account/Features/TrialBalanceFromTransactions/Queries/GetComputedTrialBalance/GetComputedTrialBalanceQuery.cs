using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Dtos;
using GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceReports.Dtos;
using MediatR;

namespace GBWeb.Implementation.Application.Modules.Account.Features.TrialBalanceFromTransactions.Queries.GetComputedTrialBalance;

/// <summary>
/// Trial balance computed from live vouchers, one row per account, as
/// JSON for the on-screen table.
/// </summary>
/// <remarks>
/// The OLRSTrailBalance snapshot holds two dates for one consolidated
/// office, so it cannot answer this form. These figures come from
/// AccTrxMaster and AccTrxDetail, the same source the general ledger
/// reads, which is why the two agree.
/// </remarks>
/// <param name="OfficeId">
/// Any office in the hierarchy. Choosing a head, zone or area office
/// includes every office beneath it; leaving it out covers all offices.
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
/// Detail lists every account at <paramref name="AccLevel"/>; Summary
/// rolls them up to their account head.
/// </param>
public sealed record GetComputedTrialBalanceQuery(
    DateTime DateFrom,
    DateTime DateTo,
    int? OfficeId,
    int? AccLevel,
    string? AccCode,
    bool ExceptHeadOffice,
    bool ExceptProjectOffice,
    TrialBalanceDetailLevel DetailLevel
) : IRequest<TrialBalanceAccCodeReportDto>;
